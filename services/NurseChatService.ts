import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    where,
} from "firebase/firestore";

export interface NurseChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface NurseConversation {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  nurseId: string;
  nurseName: string;
  nurseAvatar?: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  // Separate unread counts for each party
  patientUnreadCount: number;
  nurseUnreadCount: number;
  unreadCount: number; // Keep for backward compatibility
  lastMessageSenderId?: string;
  createdAt: Timestamp;
}

class NurseChatService {
  private conversationsCollection = "nurseConversations";
  private messagesCollection = "nurseMessages";

  // Create or get conversation between patient and nurse
  async getOrCreateConversation(
    patientId: string,
    patientName: string,
    patientAvatar: string,
    nurseId: string,
    nurseName: string,
    nurseAvatar: string
  ): Promise<string> {
    try {
      const conversationId = `nurse_${patientId}_${nurseId}`;
      const docRef = doc(db, this.conversationsCollection, conversationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          patientId,
          patientName,
          patientAvatar: patientAvatar || "",
          nurseId,
          nurseName,
          nurseAvatar: nurseAvatar || "",
          lastMessage: "",
          lastMessageTime: Timestamp.now(),
          patientUnreadCount: 0,
          nurseUnreadCount: 0,
          unreadCount: 0,
          createdAt: Timestamp.now(),
        });
      }

      return conversationId;
    } catch (error) {
      console.error("Error creating nurse conversation:", error);
      throw error;
    }
  }

  // Send message
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    message: string,
    recipientId?: string
  ): Promise<void> {
    try {
      // Add message
      await addDoc(collection(db, this.messagesCollection), {
        conversationId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || "",
        message,
        timestamp: Timestamp.now(),
        read: false,
      });

      // Get conversation to determine who gets the unread count
      const conversationRef = doc(db, this.conversationsCollection, conversationId);
      const convSnap = await getDoc(conversationRef);
      const convData = convSnap.exists() ? convSnap.data() : {};
      
      // Determine which unread counter to increment
      const isPatientSender = senderId === convData.patientId;
      const currentPatientUnread = convData.patientUnreadCount || 0;
      const currentNurseUnread = convData.nurseUnreadCount || 0;

      await setDoc(
        conversationRef,
        {
          lastMessage: message,
          lastMessageTime: Timestamp.now(),
          patientUnreadCount: isPatientSender ? currentPatientUnread : currentPatientUnread + 1,
          nurseUnreadCount: isPatientSender ? currentNurseUnread + 1 : currentNurseUnread,
          unreadCount: (isPatientSender ? currentNurseUnread + 1 : currentPatientUnread + 1),
          lastMessageSenderId: senderId,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error sending nurse message:", error);
      throw error;
    }
  }

  // Mark conversation as read for a specific party
  async markConversationAsRead(
    conversationId: string, 
    party: 'patient' | 'nurse'
  ): Promise<void> {
    try {
      const conversationRef = doc(db, this.conversationsCollection, conversationId);
      const updateData = party === 'patient' 
        ? { patientUnreadCount: 0 }
        : { nurseUnreadCount: 0 };
      
      await setDoc(
        conversationRef,
        updateData,
        { merge: true }
      );
    } catch (error) {
      console.error("Error marking nurse conversation as read:", error);
      throw error;
    }
  }

  // Listen to messages in real-time
  listenToMessages(
    conversationId: string,
    callback: (messages: NurseChatMessage[]) => void
  ) {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where("conversationId", "==", conversationId)
      );

      return onSnapshot(q, (snapshot) => {
        const messages: NurseChatMessage[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<NurseChatMessage, "id">),
          }))
          .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime());
        callback(messages);
      });
    } catch (error) {
      console.error("Error listening to nurse messages:", error);
      throw error;
    }
  }

  // Listen to patient's conversations with nurses
  listenToPatientConversations(
    patientId: string,
    callback: (conversations: NurseConversation[]) => void
  ) {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where("patientId", "==", patientId)
      );

      return onSnapshot(q, (snapshot) => {
        const conversations: NurseConversation[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<NurseConversation, "id">),
          }))
          .sort((a, b) => b.lastMessageTime.toDate().getTime() - a.lastMessageTime.toDate().getTime());
        callback(conversations);
      });
    } catch (error) {
      console.error("Error listening to patient nurse conversations:", error);
      throw error;
    }
  }

  // Listen to nurse's conversations with patients
  listenToNurseConversations(
    nurseId: string,
    callback: (conversations: NurseConversation[]) => void
  ) {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where("nurseId", "==", nurseId)
      );

      return onSnapshot(q, (snapshot) => {
        const conversations: NurseConversation[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<NurseConversation, "id">),
          }))
          .sort((a, b) => b.lastMessageTime.toDate().getTime() - a.lastMessageTime.toDate().getTime());
        callback(conversations);
      });
    } catch (error) {
      console.error("Error listening to nurse conversations:", error);
      throw error;
    }
  }
}

export default new NurseChatService();
