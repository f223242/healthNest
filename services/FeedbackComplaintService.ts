import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import NotificationService from "./NotificationService";

// Feedback Types - includes specific provider types
export type FeedbackType = 
  | "appointment" 
  | "lab_test" 
  | "nurse_visit" 
  | "nurse"       // Nurse profile rating
  | "lab"         // Lab profile rating  
  | "delivery"    // Delivery person rating
  | "app" 
  | "general";
export type FeedbackStatus = "pending" | "reviewed" | "resolved";

// Provider type for easier filtering
export type ProviderType = "nurse" | "lab" | "delivery";

// Rating Interface
export interface Rating {
  overall: number; // 1-5
  punctuality?: number;
  professionalism?: number;
  communication?: number;
  cleanliness?: number;
  valueForMoney?: number;
}

// Feedback Interface
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  // Target
  feedbackType: FeedbackType;
  targetId?: string; // appointment, nurse, lab ID
  targetName?: string;
  // Rating
  rating: Rating;
  // Comments
  title?: string;
  comment: string;
  // Pros and cons
  pros?: string[];
  cons?: string[];
  // Would recommend
  wouldRecommend: boolean;
  // Response from provider
  providerResponse?: string;
  providerRespondedAt?: Timestamp;
  // Status
  status: FeedbackStatus;
  isPublic: boolean;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Complaint Types
export type ComplaintCategory =
  | "service_quality"
  | "billing"
  | "provider_behavior"
  | "technical"
  | "delivery"
  | "other";
export type ComplaintPriority = "low" | "medium" | "high" | "urgent";
export type ComplaintStatus = "pending" | "in_progress" | "resolved" | "rejected" | "escalated";

// Complaint Interface
export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  // Complaint details
  subject: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  description: string;
  // Related entity
  relatedEntityType?: "appointment" | "lab_test" | "payment" | "nurse" | "lab" | "other";
  relatedEntityId?: string;
  // Attachments
  attachments?: string[];
  // Resolution
  status: ComplaintStatus;
  assignedTo?: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  // Timeline
  timeline: ComplaintTimelineEvent[];
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Timeline Event
export interface ComplaintTimelineEvent {
  action: string;
  performedBy: string;
  performedByName: string;
  note?: string;
  timestamp: Timestamp;
}

class FeedbackComplaintService {
  private feedbackCollection = "feedbacks";
  private complaintsCollection = "complaints";

  // ==================== FEEDBACK METHODS ====================

  // Submit feedback
  async submitFeedback(
    userId: string,
    userName: string,
    feedbackType: FeedbackType,
    rating: Rating,
    comment: string,
    options?: {
      targetId?: string;
      targetName?: string;
      title?: string;
      pros?: string[];
      cons?: string[];
      wouldRecommend?: boolean;
      isPublic?: boolean;
    }
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.feedbackCollection), {
        userId,
        userName,
        feedbackType,
        targetId: options?.targetId || null,
        targetName: options?.targetName || null,
        rating,
        title: options?.title || null,
        comment,
        pros: options?.pros || [],
        cons: options?.cons || [],
        wouldRecommend: options?.wouldRecommend ?? true,
        isPublic: options?.isPublic ?? true,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify the target provider if applicable
      if (options?.targetId) {
        await NotificationService.createNotification(
          options.targetId,
          "status",
          "New Feedback Received",
          `${userName} has left feedback: ${rating.overall}/5 stars`,
          { feedbackId: docRef.id }
        );
      }

      return docRef.id;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  // Get feedback for a target (nurse, lab, etc.)
  async getTargetFeedback(targetId: string): Promise<Feedback[]> {
    try {
      const q = query(
        collection(db, this.feedbackCollection),
        where("targetId", "==", targetId),
        where("isPublic", "==", true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Feedback, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting target feedback:", error);
      throw error;
    }
  }

  // Get average rating for a target
  async getTargetAverageRating(targetId: string): Promise<number> {
    try {
      const feedbacks = await this.getTargetFeedback(targetId);
      if (feedbacks.length === 0) return 0;

      const sum = feedbacks.reduce((acc, f) => acc + f.rating.overall, 0);
      return Math.round((sum / feedbacks.length) * 10) / 10;
    } catch (error) {
      console.error("Error getting average rating:", error);
      return 0;
    }
  }

  // Get comprehensive rating stats for provider profiles
  async getProviderRatingStats(targetId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
    recentReviews: Feedback[];
    categoryRatings: {
      punctuality: number;
      professionalism: number;
      communication: number;
      cleanliness: number;
      valueForMoney: number;
    };
    recommendationRate: number;
  }> {
    try {
      const feedbacks = await this.getTargetFeedback(targetId);
      
      if (feedbacks.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentReviews: [],
          categoryRatings: {
            punctuality: 0,
            professionalism: 0,
            communication: 0,
            cleanliness: 0,
            valueForMoney: 0,
          },
          recommendationRate: 0,
        };
      }

      // Calculate average rating
      const averageRating = Math.round(
        (feedbacks.reduce((acc, f) => acc + f.rating.overall, 0) / feedbacks.length) * 10
      ) / 10;

      // Calculate rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbacks.forEach((f) => {
        const rating = Math.round(f.rating.overall);
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
        }
      });

      // Calculate category averages
      const categoryRatings = {
        punctuality: 0,
        professionalism: 0,
        communication: 0,
        cleanliness: 0,
        valueForMoney: 0,
      };

      const categoryCounts = { ...categoryRatings };

      feedbacks.forEach((f) => {
        if (f.rating.punctuality) {
          categoryRatings.punctuality += f.rating.punctuality;
          categoryCounts.punctuality++;
        }
        if (f.rating.professionalism) {
          categoryRatings.professionalism += f.rating.professionalism;
          categoryCounts.professionalism++;
        }
        if (f.rating.communication) {
          categoryRatings.communication += f.rating.communication;
          categoryCounts.communication++;
        }
        if (f.rating.cleanliness) {
          categoryRatings.cleanliness += f.rating.cleanliness;
          categoryCounts.cleanliness++;
        }
        if (f.rating.valueForMoney) {
          categoryRatings.valueForMoney += f.rating.valueForMoney;
          categoryCounts.valueForMoney++;
        }
      });

      // Calculate averages for each category
      Object.keys(categoryRatings).forEach((key) => {
        const k = key as keyof typeof categoryRatings;
        if (categoryCounts[k] > 0) {
          categoryRatings[k] = Math.round((categoryRatings[k] / categoryCounts[k]) * 10) / 10;
        }
      });

      // Calculate recommendation rate
      const recommendCount = feedbacks.filter((f) => f.wouldRecommend).length;
      const recommendationRate = Math.round((recommendCount / feedbacks.length) * 100);

      return {
        averageRating,
        totalReviews: feedbacks.length,
        ratingDistribution,
        recentReviews: feedbacks.slice(0, 5), // Last 5 reviews
        categoryRatings,
        recommendationRate,
      };
    } catch (error) {
      console.error("Error getting provider rating stats:", error);
      throw error;
    }
  }

  // Listen to real-time reviews for a provider
  listenToProviderReviews(
    targetId: string,
    callback: (reviews: Feedback[]) => void
  ): () => void {
    const q = query(
      collection(db, this.feedbackCollection),
      where("targetId", "==", targetId),
      where("isPublic", "==", true)
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Feedback, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(reviews);
    });
  }

  // Provider: Respond to feedback
  async respondToFeedback(
    feedbackId: string,
    providerId: string,
    response: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.feedbackCollection, feedbackId), {
        providerResponse: response,
        providerRespondedAt: Timestamp.now(),
        status: "resolved",
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error responding to feedback:", error);
      throw error;
    }
  }

  // Listen to user's feedback
  listenToUserFeedback(
    userId: string,
    callback: (feedbacks: Feedback[]) => void
  ) {
    const q = query(
      collection(db, this.feedbackCollection),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const feedbacks: Feedback[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Feedback, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(feedbacks);
    });
  }

  // ==================== COMPLAINT METHODS ====================

  // Submit complaint
  async submitComplaint(
    userId: string,
    userName: string,
    userEmail: string,
    subject: string,
    category: ComplaintCategory,
    priority: ComplaintPriority,
    description: string,
    options?: {
      userPhone?: string;
      relatedEntityType?: Complaint["relatedEntityType"];
      relatedEntityId?: string;
      attachments?: string[];
    }
  ): Promise<string> {
    try {
      const initialTimeline: ComplaintTimelineEvent[] = [
        {
          action: "Complaint submitted",
          performedBy: userId,
          performedByName: userName,
          timestamp: Timestamp.now(),
        },
      ];

      const docRef = await addDoc(collection(db, this.complaintsCollection), {
        userId,
        userName,
        userEmail,
        userPhone: options?.userPhone || null,
        subject,
        category,
        priority,
        description,
        relatedEntityType: options?.relatedEntityType || null,
        relatedEntityId: options?.relatedEntityId || null,
        attachments: options?.attachments || [],
        status: "pending",
        timeline: initialTimeline,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify all admins about new complaint
      await NotificationService.notifyAllAdmins(
        "complaint",
        `New ${priority.toUpperCase()} Priority Complaint`,
        `${userName} submitted: ${subject}`,
        { complaintId: docRef.id, priority, category }
      );

      return docRef.id;
    } catch (error) {
      console.error("Error submitting complaint:", error);
      throw error;
    }
  }

  // Admin: Update complaint status
  async updateComplaintStatus(
    complaintId: string,
    adminId: string,
    adminName: string,
    status: ComplaintStatus,
    note?: string
  ): Promise<void> {
    try {
      const complaintRef = doc(db, this.complaintsCollection, complaintId);
      const complaintSnap = await getDoc(complaintRef);

      if (!complaintSnap.exists()) throw new Error("Complaint not found");

      const complaint = complaintSnap.data() as Complaint;
      const timeline = [...(complaint.timeline || [])];

      // Create timeline event - only include note if it exists
      const timelineEvent: ComplaintTimelineEvent = {
        action: `Status changed to ${status}`,
        performedBy: adminId,
        performedByName: adminName,
        timestamp: Timestamp.now(),
      };
      if (note) {
        timelineEvent.note = note;
      }
      timeline.push(timelineEvent);

      // Build update object without undefined values
      const updateData: any = {
        status,
        timeline,
        updatedAt: Timestamp.now(),
      };
      
      // Only set assignedTo if it has a value
      if (status === "in_progress") {
        updateData.assignedTo = adminId;
      } else if (complaint.assignedTo) {
        updateData.assignedTo = complaint.assignedTo;
      }

      await updateDoc(complaintRef, updateData);

      // Notify user
      await NotificationService.createNotification(
        complaint.userId,
        "status",
        "Complaint Update",
        `Your complaint "${complaint.subject}" status: ${status.replace("_", " ").toUpperCase()}`,
        { complaintId }
      );
    } catch (error) {
      console.error("Error updating complaint status:", error);
      throw error;
    }
  }

  // Admin: Resolve complaint
  async resolveComplaint(
    complaintId: string,
    adminId: string,
    adminName: string,
    resolution: string
  ): Promise<void> {
    try {
      const complaintRef = doc(db, this.complaintsCollection, complaintId);
      const complaintSnap = await getDoc(complaintRef);

      if (!complaintSnap.exists()) throw new Error("Complaint not found");

      const complaint = complaintSnap.data() as Complaint;
      const timeline = [...(complaint.timeline || [])];

      timeline.push({
        action: "Complaint resolved",
        performedBy: adminId,
        performedByName: adminName,
        note: resolution,
        timestamp: Timestamp.now(),
      });

      await updateDoc(complaintRef, {
        status: "resolved",
        resolution,
        resolvedBy: adminId,
        resolvedAt: Timestamp.now(),
        timeline,
        updatedAt: Timestamp.now(),
      });

      // Notify user
      await NotificationService.createNotification(
        complaint.userId,
        "status",
        "Complaint Resolved",
        `Your complaint "${complaint.subject}" has been resolved.`,
        { complaintId, resolution }
      );
    } catch (error) {
      console.error("Error resolving complaint:", error);
      throw error;
    }
  }

  // Admin: Add note to complaint
  async addComplaintNote(
    complaintId: string,
    adminId: string,
    adminName: string,
    note: string
  ): Promise<void> {
    try {
      const complaintRef = doc(db, this.complaintsCollection, complaintId);
      const complaintSnap = await getDoc(complaintRef);

      if (!complaintSnap.exists()) throw new Error("Complaint not found");

      const complaint = complaintSnap.data() as Complaint;
      const timeline = [...(complaint.timeline || [])];

      timeline.push({
        action: "Note added",
        performedBy: adminId,
        performedByName: adminName,
        note,
        timestamp: Timestamp.now(),
      });

      await updateDoc(complaintRef, {
        timeline,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  }

  // Get user's complaints
  async getUserComplaints(userId: string): Promise<Complaint[]> {
    try {
      const q = query(
        collection(db, this.complaintsCollection),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Complaint, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting user complaints:", error);
      throw error;
    }
  }

  // Listen to user's complaints in real-time
  listenToUserComplaints(
    userId: string,
    callback: (complaints: Complaint[]) => void
  ) {
    const q = query(
      collection(db, this.complaintsCollection),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const complaints: Complaint[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Complaint, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(complaints);
    });
  }

  // Admin: Listen to all complaints
  listenToComplaints(
    callback: (complaints: Complaint[]) => void,
    statusFilter?: ComplaintStatus
  ) {
    let q = query(collection(db, this.complaintsCollection));

    if (statusFilter) {
      q = query(
        collection(db, this.complaintsCollection),
        where("status", "==", statusFilter)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const complaints: Complaint[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Complaint, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(complaints);
    });
  }

  // Get complaint by ID
  async getComplaintById(complaintId: string): Promise<Complaint | null> {
    try {
      const docSnap = await getDoc(doc(db, this.complaintsCollection, complaintId));
      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Complaint, "id">),
      };
    } catch (error) {
      console.error("Error getting complaint:", error);
      throw error;
    }
  }

  // Get complaints count by status
  async getComplaintsCount(): Promise<Record<ComplaintStatus, number>> {
    try {
      const snapshot = await getDocs(collection(db, this.complaintsCollection));
      
      const counts: Record<ComplaintStatus, number> = {
        pending: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
        escalated: 0,
      };

      snapshot.docs.forEach((doc) => {
        const status = doc.data().status as ComplaintStatus;
        if (counts[status] !== undefined) {
          counts[status]++;
        }
      });

      return counts;
    } catch (error) {
      console.error("Error getting complaints count:", error);
      throw error;
    }
  }
}

export default new FeedbackComplaintService();
