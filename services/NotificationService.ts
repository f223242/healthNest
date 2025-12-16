import { db } from "@/config/firebase";
import { addDoc, collection, doc, onSnapshot, query, setDoc, Timestamp, where } from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "order" | "status" | "appointment";
  title: string;
  body: string;
  data: any;
  read: boolean;
  timestamp: Timestamp;
}

class NotificationService {
  // Create notification
  async createNotification(
    userId: string,
    type: "message" | "order" | "status" | "appointment",
    title: string,
    body: string,
    data: any
  ): Promise<void> {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type,
        title,
        body,
        data,
        read: false,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Listen to notifications
  listenToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        }));
        callback(notifications);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error listening to notifications:", error);
      throw error;
    }
  }

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await setDoc(
        doc(db, "notifications", notificationId),
        { read: true },
        { merge: true }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
}

export default new NotificationService();