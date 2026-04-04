import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
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
  lastMessageSenderId?: string;
  createdAt: Timestamp;
}

export interface LabDeliveryConversation {
  id: string;
  labId: string;
  labName: string;
  labAvatar: string;
  deliveryId: string;
  deliveryName: string;
  deliveryAvatar: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
  lastMessageSenderId?: string;
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
    deliveryPersonAvatar: string,
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
    recipientId?: string,
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
          unreadCount:
            unreadIncrement > 0
              ? Math.max(
                  0,
                  (await getDoc(conversationRef)).data()?.unreadCount || 0,
                ) + 1
              : 0,
          lastMessageSenderId: senderId,
        },
        { merge: true },
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
        { merge: true },
      );

      // Mark all messages in conversation as read
      const messagesSnap = await getDoc(conversationRef);
      if (messagesSnap.exists()) {
        const q = query(
          collection(db, "messages"),
          where("conversationId", "==", conversationId),
          where("read", "==", false),
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
    callback: (messages: ChatMessage[]) => void,
  ) {
    try {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ChatMessage, "id">),
          }))
          .sort(
            (a, b) =>
              a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime(),
          );
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
    isDeliveryPerson: boolean = false,
  ) {
    try {
      const filterField = isDeliveryPerson ? "deliveryPersonId" : "patientId";

      const q = query(
        collection(db, "conversations"),
        where(filterField, "==", userId),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Conversation, "id">),
          }))
          .sort(
            (a, b) =>
              b.lastMessageTime.toDate().getTime() -
              a.lastMessageTime.toDate().getTime(),
          );
        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error listening to conversations:", error);
      throw error;
    }
  }

  // Lab-Delivery Chat Functions
  // Create or get lab-delivery conversation
  async getOrCreateLabDeliveryConversation(
    labId: string,
    labName: string,
    labAvatar: string,
    deliveryId: string,
    deliveryName: string,
    deliveryAvatar: string,
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, "labDeliveryConversations"),
        where("labId", "==", labId),
        where("deliveryId", "==", deliveryId),
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        return existing.docs[0].id;
      }

      // Create new conversation
      const conversationData = {
        labId,
        labName,
        labAvatar,
        deliveryId,
        deliveryName,
        deliveryAvatar,
        lastMessage: "",
        lastMessageTime: Timestamp.now(),
        unreadCount: 0,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "labDeliveryConversations"),
        conversationData,
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating lab-delivery conversation:", error);
      throw error;
    }
  }

  // Send message in lab-delivery conversation
  async sendLabDeliveryMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    message: string,
  ): Promise<void> {
    try {
      const messageData = {
        conversationId,
        senderId,
        senderName,
        senderAvatar,
        message,
        timestamp: Timestamp.now(),
        read: false,
      };

      await addDoc(collection(db, "labDeliveryMessages"), messageData);

      // Update conversation last message
      await updateDoc(doc(db, "labDeliveryConversations", conversationId), {
        lastMessage: message,
        lastMessageTime: Timestamp.now(),
        lastMessageSenderId: senderId,
        unreadCount: increment(1),
      });
    } catch (error) {
      console.error("Error sending lab-delivery message:", error);
      throw error;
    }
  }

  // Listen to lab-delivery conversations for a user
  listenToLabDeliveryConversations(
    userId: string,
    userRole: "lab" | "delivery",
    callback: (conversations: LabDeliveryConversation[]) => void,
  ) {
    try {
      const field = userRole === "lab" ? "labId" : "deliveryId";
      const q = query(
        collection(db, "labDeliveryConversations"),
        where(field, "==", userId),
      );

      return onSnapshot(q, (snapshot) => {
        const conversations: LabDeliveryConversation[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<LabDeliveryConversation, "id">),
          }))
          .sort(
            (a, b) =>
              b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis(),
          );
        callback(conversations);
      });
    } catch (error) {
      console.error("Error listening to lab-delivery conversations:", error);
      throw error;
    }
  }

  // Listen to messages in lab-delivery conversation (sort client-side to avoid index requirement)
  listenToLabDeliveryMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
  ) {
    try {
      const q = query(
        collection(db, "labDeliveryMessages"),
        where("conversationId", "==", conversationId),
      );

      return onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ChatMessage, "id">),
          }))
          .sort(
            (a, b) =>
              a.timestamp.toMillis() - b.timestamp.toMillis(),
          );
        callback(messages);
      });
    } catch (error) {
      console.error("Error listening to lab-delivery messages:", error);
      throw error;
    }
  }

  // Mark lab-delivery messages as read
  async markLabDeliveryMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const q = query(
        collection(db, "labDeliveryMessages"),
        where("conversationId", "==", conversationId),
        where("senderId", "!=", userId),
        where("read", "==", false),
      );
      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { read: true }),
      );
      await Promise.all(promises);

      // Reset unread count
      await updateDoc(doc(db, "labDeliveryConversations", conversationId), {
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Error marking lab-delivery messages as read:", error);
      throw error;
    }
  }
}

export default new ChatService();
