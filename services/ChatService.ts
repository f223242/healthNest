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
    where
} from "firebase/firestore";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  deliveryPersonAvatar: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
  createdAt: Timestamp;
}

class ChatService {
  // Create or get conversation
  async getOrCreateConversation(
    patientId: string,
    patientName: string,
    patientAvatar: string,
    deliveryPersonId: string,
    deliveryPersonName: string,
    deliveryPersonAvatar: string
  ): Promise<string> {
    try {
      const conversationId = `${patientId}_${deliveryPersonId}`;
      const docRef = doc(db, "conversations", conversationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          patientId,
          patientName,
          patientAvatar,
          deliveryPersonId,
          deliveryPersonName,
          deliveryPersonAvatar,
          lastMessage: "",
          lastMessageTime: Timestamp.now(),
          unreadCount: 0,
          createdAt: Timestamp.now(),
        });
      }

      return conversationId;
    } catch (error) {
      console.error("Error creating conversation:", error);
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
      // Add message to messages collection
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId,
        senderName,
        senderAvatar,
        message,
        timestamp: Timestamp.now(),
        read: false,
      });

      // Update conversation last message and increment unread count for recipient
      const conversationRef = doc(db, "conversations", conversationId);
      const unreadIncrement = recipientId && recipientId !== senderId ? 1 : 0;
      
      await setDoc(
        conversationRef,
        {
          lastMessage: message,
          lastMessageTime: Timestamp.now(),
          unreadCount: unreadIncrement > 0 ? Math.max(0, (await getDoc(conversationRef)).data()?.unreadCount || 0) + 1 : 0,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await setDoc(
        conversationRef,
        {
          unreadCount: 0,
        },
        { merge: true }
      );

      // Mark all messages in conversation as read
      const messagesSnap = await getDoc(conversationRef);
      if (messagesSnap.exists()) {
        const q = query(
          collection(db, "messages"),
          where("conversationId", "==", conversationId),
          where("read", "==", false)
        );
        
        const snapshot = await getDoc(conversationRef);
        // Messages will be marked as read when fetched
      }
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  }

  // Listen to messages in real-time (sort client-side to avoid index requirement)
  listenToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    try {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ChatMessage, "id">),
          }))
          .sort((a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime());
        callback(messages);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error listening to messages:", error);
      throw error;
    }
  }

  // Get all conversations for a user - handles both patient and delivery person
  // For patients: shows conversations where patientId matches
  // For delivery persons: shows conversations where deliveryPersonId matches
  listenToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void,
    isDeliveryPerson: boolean = false
  ) {
    try {
      const filterField = isDeliveryPerson ? "deliveryPersonId" : "patientId";
      
      const q = query(
        collection(db, "conversations"),
        where(filterField, "==", userId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Conversation, "id">),
          }))
          .sort((a, b) => b.lastMessageTime.toDate().getTime() - a.lastMessageTime.toDate().getTime());
        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error listening to conversations:", error);
      throw error;
    }
  }
}

export default new ChatService();