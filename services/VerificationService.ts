import { db, storage } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import NotificationService from "./NotificationService";

// Verification Types
export type VerificationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";
export type DocumentType =
  | "cnic_front"
  | "cnic_back"
  | "selfie"
  | "passport"
  | "driving_license";

// Verification Request Interface
export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  // Documents
  documents: VerificationDocument[];
  // Extracted data (from ID)
  extractedData?: {
    fullName?: string;
    cnicNumber?: string;
    dateOfBirth?: string;
    address?: string;
    expiryDate?: string;
  };
  // Verification results
  faceMatchScore?: number;
  documentAuthenticityScore?: number;
  // Third-party verification
  thirdPartyVerified?: boolean;
  thirdPartyResponse?: any;
  // Status
  status: VerificationStatus;
  // Admin review
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  notes?: string;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;
}

// Document Interface
export interface VerificationDocument {
  type: DocumentType;
  imageUrl: string;
  uploadedAt: Timestamp;
  verified?: boolean;
  verificationNotes?: string;
}

// Verification Result from third-party API (simulated)
interface VerificationResult {
  success: boolean;
  faceMatchScore: number;
  documentAuthentic: boolean;
  extractedData: {
    fullName: string;
    cnicNumber: string;
    dateOfBirth: string;
    address: string;
    expiryDate: string;
  };
  message: string;
}

class VerificationService {
  private collectionName = "verificationRequests";

  // Test mode flag
  private isTestMode = true;

  // ==================== UPLOAD METHODS ====================

  // Upload verification document
  async uploadDocument(
    userId: string,
    documentType: DocumentType,
    imageUri: string,
  ): Promise<string> {
    try {
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create unique file path
      const fileName = `${userId}/${documentType}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `verifications/${fileName}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  // ==================== VERIFICATION METHODS ====================

  // Submit verification request
  async submitVerification(
    userId: string,
    userName: string,
    userEmail: string,
    userPhone: string,
    cnicFrontUri: string,
    cnicBackUri: string,
    selfieUri: string,
  ): Promise<string> {
    try {
      // Upload all documents
      const [cnicFrontUrl, cnicBackUrl, selfieUrl] = await Promise.all([
        this.uploadDocument(userId, "cnic_front", cnicFrontUri),
        this.uploadDocument(userId, "cnic_back", cnicBackUri),
        this.uploadDocument(userId, "selfie", selfieUri),
      ]);

      // Create verification request
      const documents: VerificationDocument[] = [
        {
          type: "cnic_front",
          imageUrl: cnicFrontUrl,
          uploadedAt: Timestamp.now(),
        },
        {
          type: "cnic_back",
          imageUrl: cnicBackUrl,
          uploadedAt: Timestamp.now(),
        },
        { type: "selfie", imageUrl: selfieUrl, uploadedAt: Timestamp.now() },
      ];

      const docRef = await addDoc(collection(db, this.collectionName), {
        userId,
        userName,
        userEmail,
        userPhone,
        documents,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // In test mode, automatically run verification
      if (this.isTestMode) {
        await this.runAutomaticVerification(docRef.id, documents);
      }

      // Notify admin
      await NotificationService.createNotification(
        "admin",
        "status",
        "New Verification Request",
        `${userName} has submitted identity verification documents.`,
        { requestId: docRef.id },
      );

      return docRef.id;
    } catch (error) {
      console.error("Error submitting verification:", error);
      throw error;
    }
  }

  // Simulate third-party verification (Test Mode)
  private async runAutomaticVerification(
    requestId: string,
    documents: VerificationDocument[],
  ): Promise<void> {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate verification result
      const result = this.simulateVerification();

      // Update request with results
      await updateDoc(doc(db, this.collectionName, requestId), {
        status: "under_review",
        faceMatchScore: result.faceMatchScore,
        documentAuthenticityScore: result.documentAuthentic ? 95 : 45,
        extractedData: result.extractedData,
        thirdPartyVerified: result.success,
        thirdPartyResponse: result,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error running automatic verification:", error);
    }
  }

  // Simulate verification result
  private simulateVerification(): VerificationResult {
    // Random success rate for testing (80% success)
    const isSuccess = Math.random() > 0.2;
    const faceMatchScore = isSuccess
      ? 85 + Math.random() * 15
      : 40 + Math.random() * 30;

    return {
      success: isSuccess && faceMatchScore > 70,
      faceMatchScore: Math.round(faceMatchScore),
      documentAuthentic: isSuccess,
      extractedData: {
        fullName: "Test User",
        cnicNumber: "12345-6789012-3",
        dateOfBirth: "1990-01-15",
        address: "House 123, Street 45, Lahore",
        expiryDate: "2030-12-31",
      },
      message: isSuccess
        ? "Verification successful"
        : "Face match failed or document unclear",
    };
  }

  // ==================== ADMIN METHODS ====================

  // Admin: Approve verification
  async approveVerification(
    requestId: string,
    adminId: string,
    notes?: string,
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) throw new Error("Request not found");

      const requestData = requestSnap.data() as VerificationRequest;

      // Update verification request
      await updateDoc(requestRef, {
        status: "approved",
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
        notes,
        updatedAt: Timestamp.now(),
        // Set expiry to 2 years from now
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        ),
      });

      // Update user's profile to mark as verified
      await updateDoc(doc(db, "users", requestData.userId), {
        identityVerified: true,
        verificationRequestId: requestId,
        verifiedAt: Timestamp.now(),
      });

      // Notify user
      await NotificationService.createNotification(
        requestData.userId,
        "status",
        "Identity Verified!",
        "Your identity has been verified successfully. You now have access to all features.",
        { requestId },
      );
    } catch (error) {
      console.error("Error approving verification:", error);
      throw error;
    }
  }

  // Admin: Reject verification
  async rejectVerification(
    requestId: string,
    adminId: string,
    reason: string,
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) throw new Error("Request not found");

      const requestData = requestSnap.data() as VerificationRequest;

      await updateDoc(requestRef, {
        status: "rejected",
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
        rejectionReason: reason,
        updatedAt: Timestamp.now(),
      });

      // Notify user
      await NotificationService.createNotification(
        requestData.userId,
        "status",
        "Verification Update",
        `Your identity verification was not successful. Reason: ${reason}`,
        { requestId },
      );
    } catch (error) {
      console.error("Error rejecting verification:", error);
      throw error;
    }
  }

  // ==================== QUERY METHODS ====================

  // Get user's verification status
  async getUserVerificationStatus(
    userId: string,
  ): Promise<VerificationRequest | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      // Get the most recent verification
      const requests = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<VerificationRequest, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      return requests[0];
    } catch (error) {
      console.error("Error getting verification status:", error);
      throw error;
    }
  }

  // Check if user is verified
  async isUserVerified(userId: string): Promise<boolean> {
    try {
      const verification = await this.getUserVerificationStatus(userId);
      return verification?.status === "approved";
    } catch (error) {
      console.error("Error checking verification:", error);
      return false;
    }
  }

  // Admin: Listen to all verification requests
  listenToVerificationRequests(
    callback: (requests: VerificationRequest[]) => void,
    statusFilter?: VerificationStatus,
  ) {
    let q = query(collection(db, this.collectionName));

    if (statusFilter) {
      q = query(
        collection(db, this.collectionName),
        where("status", "==", statusFilter),
      );
    }

    return onSnapshot(q, (snapshot) => {
      const requests: VerificationRequest[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<VerificationRequest, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(requests);
    });
  }

  // Get verification by ID
  async getVerificationById(
    requestId: string,
  ): Promise<VerificationRequest | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, requestId));
      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<VerificationRequest, "id">),
      };
    } catch (error) {
      console.error("Error getting verification:", error);
      throw error;
    }
  }

  // Admin: Get pending verifications count
  async getPendingVerificationsCount(): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("status", "in", ["pending", "under_review"]),
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting pending count:", error);
      return 0;
    }
  }

  // Listen to a single user's verification
  listenToUserVerification(
    userId: string,
    callback: (verification: VerificationRequest | null) => void,
  ) {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId),
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      // Get the most recent verification
      const verifications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<VerificationRequest, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      callback(verifications[0]);
    });
  }

  // Alias for admin verifications screen
  listenToAllVerifications(
    callback: (requests: VerificationRequest[]) => void,
  ) {
    return this.listenToVerificationRequests(callback);
  }

  // ==================== LAB DELIVERY ONBOARDING ====================

  // Admin: Listen to all lab delivery onboarding requests
  listenToLabDeliveryOnboarding(callback: (users: any[]) => void) {
    // Query pending_verifications collection
    const q = query(collection(db, "pending_verifications"));

    return onSnapshot(q, async (snapshot) => {
      const pendingVerifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get user details for each pending verification
      const usersWithDetails = await Promise.all(
        pendingVerifications.map(async (pv) => {
          try {
            const userDoc = await getDoc(doc(db, "users", pv.id));
            if (userDoc.exists()) {
              return {
                ...pv,
                ...userDoc.data(),
              };
            }
            return pv;
          } catch (error) {
            console.error("Error fetching user details:", error);
            return pv;
          }
        }),
      );

      callback(usersWithDetails);
    });
  }

  // Admin: Approve lab delivery boy
  async approveLabDelivery(userId: string, adminId: string): Promise<void> {
    console.log(
      `🚀 [VerificationService] Attempting to APPROVE user: ${userId} by Admin: ${adminId}`,
    );
    try {
      // First, get current user data to log it
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log(`📋 [VerificationService] Current user data:`, {
          role: userData.role,
          isApproved: userData.isApproved,
          deliveryType: userData.deliveryType,
        });
      }

      // Update users collection
      await setDoc(
        userRef,
        {
          isApproved: true,
          status: "approved",
          verificationStatus: "approved",
          reviewedBy: adminId,
          reviewedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
      console.log(
        `✅ [VerificationService] User ${userId} marked as approved in 'users' collection`,
      );

      // Verify the update
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.data();
        console.log(`🔍 [VerificationService] Updated user data:`, {
          role: updatedData.role,
          isApproved: updatedData.isApproved,
          deliveryType: updatedData.deliveryType,
        });
      }

      // Update pending_verifications
      const pvRef = doc(db, "pending_verifications", userId);
      await setDoc(
        pvRef,
        {
          status: "approved",
          reviewedBy: adminId,
          reviewedAt: Timestamp.now(),
        },
        { merge: true },
      );
      console.log(
        `✅ [VerificationService] User ${userId} marked as approved in 'pending_verifications' collection`,
      );

      // Notify user
      await NotificationService.createNotification(
        userId,
        "status",
        "Account Approved!",
        "Your Lab Delivery account has been approved. You can now start receiving orders.",
        { type: "onboarding_approval" },
      );
    } catch (error) {
      console.error(
        "❌ [VerificationService] Error approving lab delivery:",
        error,
      );
      throw error;
    }
  }

  // Admin: Reject lab delivery boy
  async rejectLabDelivery(
    userId: string,
    adminId: string,
    reason: string,
  ): Promise<void> {
    console.log(
      `🚀 [VerificationService] Attempting to REJECT user: ${userId} by Admin: ${adminId}. Reason: ${reason}`,
    );
    try {
      // Update users collection
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          isApproved: false,
          status: "rejected",
          verificationStatus: "rejected",
          rejectionReason: reason,
          reviewedBy: adminId,
          reviewedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
      console.log(
        `✅ [VerificationService] User ${userId} marked as rejected in 'users' collection`,
      );

      // Update pending_verifications
      const pvRef = doc(db, "pending_verifications", userId);
      await setDoc(
        pvRef,
        {
          status: "rejected",
          rejectionReason: reason,
          reviewedBy: adminId,
          reviewedAt: Timestamp.now(),
        },
        { merge: true },
      );
      console.log(
        `✅ [VerificationService] User ${userId} marked as rejected in 'pending_verifications' collection`,
      );

      // Notify user
      await NotificationService.createNotification(
        userId,
        "status",
        "Onboarding Update",
        `Your Lab Delivery application was not approved. Reason: ${reason}`,
        { type: "onboarding_rejection" },
      );
    } catch (error) {
      console.error(
        "❌ [VerificationService] Error rejecting lab delivery:",
        error,
      );
      throw error;
    }
  }

  // Get approved lab delivery boys
  async getApprovedLabDeliveryBoys(): Promise<any[]> {
    try {
      console.log("🔍 [getApprovedLabDeliveryBoys] Starting query...");

      // Query all approved users and filter in code to avoid index issues
      const allApproved = query(
        collection(db, "users"),
        where("isApproved", "==", true),
      );
      const allSnap = await getDocs(allApproved);
      console.log(
        `📊 [getApprovedLabDeliveryBoys] Found ${allSnap.docs.length} approved users total`,
      );

      const labDeliveryBoys = allSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => {
          const role = (u.role || "").toString().toLowerCase().trim();
          const isLabDelivery =
            role === "lab-delivery-boy" ||
            role === "lab delivery boy" ||
            role.includes("lab-delivery");
          if (isLabDelivery) {
            console.log(
              `🎯 [getApprovedLabDeliveryBoys] Found lab delivery boy: ${u.id} - ${u.firstname} ${u.lastname} - role: "${u.role}" - isApproved: ${u.isApproved}`,
            );
          }
          return isLabDelivery;
        });

      console.log(
        `✅ [getApprovedLabDeliveryBoys] Final result: ${labDeliveryBoys.length} lab delivery boys found`,
      );

      return labDeliveryBoys;
    } catch (error) {
      console.error("❌ [getApprovedLabDeliveryBoys] Error:", error);
      throw error;
    }
  }

  // Admin: Listen to count of all pending verifications (Identity + Lab)
  listenToPendingVerificationsCount(callback: (count: number) => void) {
    const vq = query(
      collection(db, this.collectionName),
      where("status", "in", ["pending", "under_review"]),
    );
    const pq = query(
      collection(db, "pending_verifications"),
      where("status", "==", "pending"),
    );

    let vCount = 0;
    let pCount = 0;

    const unsubV = onSnapshot(vq, (snap) => {
      vCount = snap.size;
      callback(vCount + pCount);
    });

    const unsubP = onSnapshot(pq, (snap) => {
      pCount = snap.size;
      callback(vCount + pCount);
    });

    return () => {
      unsubV();
      unsubP();
    };
  }
}

// Export types
export type UserVerification = VerificationRequest;

export default new VerificationService();
