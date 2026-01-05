import { db } from "@/config/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, Timestamp, where } from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "order" | "status" | "appointment" | "complaint";
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
    type: "message" | "order" | "status" | "appointment" | "complaint",
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

  // Notify all admins
  async notifyAllAdmins(
    type: "message" | "order" | "status" | "appointment" | "complaint",
    title: string,
    body: string,
    data: any
  ): Promise<void> {
    try {
      // Get all admin users
      const adminsQuery = query(
        collection(db, "users"),
        where("role", "==", "admin")
      );
      const adminsSnapshot = await getDocs(adminsQuery);

      // Create notification for each admin
      const notificationPromises = adminsSnapshot.docs.map((adminDoc) =>
        this.createNotification(adminDoc.id, type, title, body, data)
      );

      await Promise.all(notificationPromises);
      console.log(`Notified ${adminsSnapshot.docs.length} admin(s)`);
    } catch (error) {
      console.error("Error notifying admins:", error);
      // Don't throw - notification failure shouldn't break the main flow
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

  // ==================== REMINDER METHODS ====================

  // Schedule appointment reminder (5 minutes before)
  async scheduleAppointmentReminder(
    userId: string,
    appointmentId: string,
    providerName: string,
    appointmentTime: Date,
    appointmentType: "nurse" | "lab"
  ): Promise<string | null> {
    try {
      // Calculate 5 minutes before appointment
      const reminderTime = new Date(appointmentTime.getTime() - 5 * 60 * 1000);
      const now = new Date();

      // If reminder time is in the past, don't schedule
      if (reminderTime <= now) {
        console.log("Reminder time is in the past, skipping");
        return null;
      }

      // Create scheduled reminder in Firestore
      const reminderRef = await addDoc(collection(db, "scheduledReminders"), {
        userId,
        appointmentId,
        providerName,
        appointmentTime: Timestamp.fromDate(appointmentTime),
        reminderTime: Timestamp.fromDate(reminderTime),
        appointmentType,
        sent: false,
        createdAt: Timestamp.now(),
      });

      return reminderRef.id;
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      throw error;
    }
  }

  // Check and send due reminders (to be called periodically)
  async checkAndSendDueReminders(): Promise<number> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, "scheduledReminders"),
        where("sent", "==", false),
        where("reminderTime", "<=", now)
      );

      const snapshot = await import("firebase/firestore").then(m => m.getDocs(q));
      let sentCount = 0;

      for (const reminderDoc of snapshot.docs) {
        const reminder = reminderDoc.data();
        
        // Create notification
        await this.createNotification(
          reminder.userId,
          "appointment",
          "Appointment Reminder",
          `Your ${reminder.appointmentType} appointment with ${reminder.providerName} starts in 5 minutes!`,
          {
            appointmentId: reminder.appointmentId,
            appointmentType: reminder.appointmentType,
          }
        );

        // Mark as sent
        await setDoc(reminderDoc.ref, { sent: true }, { merge: true });
        sentCount++;
      }

      return sentCount;
    } catch (error) {
      console.error("Error checking reminders:", error);
      throw error;
    }
  }

  // Start reminder checker (for testing - runs every minute)
  startReminderChecker(intervalMs: number = 60000): () => void {
    console.log("Starting reminder checker...");
    
    const intervalId = setInterval(async () => {
      try {
        const count = await this.checkAndSendDueReminders();
        if (count > 0) {
          console.log(`Sent ${count} reminder(s)`);
        }
      } catch (error) {
        console.error("Reminder checker error:", error);
      }
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log("Reminder checker stopped");
    };
  }

  // Cancel scheduled reminder
  async cancelReminder(appointmentId: string): Promise<void> {
    try {
      const q = query(
        collection(db, "scheduledReminders"),
        where("appointmentId", "==", appointmentId),
        where("sent", "==", false)
      );

      const snapshot = await import("firebase/firestore").then(m => m.getDocs(q));
      const batch = await import("firebase/firestore").then(m => m.writeBatch(db));

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error canceling reminder:", error);
      throw error;
    }
  }

  // Get upcoming reminders for user
  async getUpcomingReminders(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, "scheduledReminders"),
        where("userId", "==", userId),
        where("sent", "==", false)
      );

      const snapshot = await import("firebase/firestore").then(m => m.getDocs(q));
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a: any, b: any) => a.reminderTime.toMillis() - b.reminderTime.toMillis());
    } catch (error) {
      console.error("Error getting upcoming reminders:", error);
      throw error;
    }
  }
}

export default new NotificationService();