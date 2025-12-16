import { db } from "@/config/firebase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, Timestamp, where } from "firebase/firestore";

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
        where("userId", "==", userId)
        // Removed validation for read status to fetch all notifications
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Notification, "id">),
          }))
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // Sort by newest first
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

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
      );

      const snapshot = await import("firebase/firestore").then(m => m.getDocs(q));

      const batch = await import("firebase/firestore").then(m => m.writeBatch(db));

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId)
      );

      const snapshot = await import("firebase/firestore").then(m => m.getDocs(q));
      const batch = await import("firebase/firestore").then(m => m.writeBatch(db));

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw error;
    }
  }
}

export default new NotificationService();