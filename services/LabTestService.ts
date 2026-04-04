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

export type TestRequestStatus =
  | "pending"
  | "accepted"
  | "sample_collected"
  | "processing"
  | "report_ready"
  | "completed"
  | "cancelled";

export type CollectionType = "home_sampling" | "lab_visit";
export type Priority = "normal" | "urgent" | "critical";

export interface LabTestRequest {
  id: string;
  // Patient info
  userId: string;
  userName: string;
  userPhone: string;
  userImage?: string;
  // Lab info
  labId: string;
  labName: string;
  labImage?: string;
  // Test details
  testType: string;
  tests: string[]; // Array of selected tests
  sampleType: string;
  collectionType: CollectionType;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  status: TestRequestStatus;
  // Delivery info (for home sampling)
  deliveryId?: string;
  deliveryName?: string;
  deliveryPhone?: string;
  // Payment info
  paymentMethod?: string; // card | cash | wallet | bnpl
  paymentStatus?:
    | "pending"
    | "paid_to_admin"
    | "cash_collected"
    | "released_to_provider";
  // Additional info
  address?: string;
  notes?: string;
  doctorName?: string;
  // Report
  reportUrl?: string;
  reportNotes?: string;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

class LabTestService {
  private collectionName = "labTestRequests";

  // Create a new test request (Patient booking a test)
  async createTestRequest(
    data: Omit<LabTestRequest, "id" | "createdAt" | "updatedAt" | "status">,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify the lab
      await NotificationService.createNotification(
        data.labId,
        "order",
        "New Test Request",
        `${data.userName} has requested ${data.testType}`,
        {
          testRequestId: docRef.id,
          userId: data.userId,
          userName: data.userName,
          testType: data.testType,
          collectionType: data.collectionType,
        },
      );

      return docRef.id;
    } catch (error) {
      console.error("Error creating test request:", error);
      throw error;
    }
  }

  // Update test request status (Lab updating status)
  async updateTestRequestStatus(
    requestId: string,
    status: TestRequestStatus,
    request: LabTestRequest,
    additionalData?: Partial<LabTestRequest>,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
        ...additionalData,
      };

      await updateDoc(doc(db, this.collectionName, requestId), updateData);

      // Handle escrow release schedule if completed
      if (status === "completed") {
        try {
          const q = query(
            collection(db, "adminWallet"),
            where("entityId", "==", requestId),
            where("status", "in", ["held_in_escrow", "cash_collected"]),
          );
          const walletSnap = await getDocs(q);
          for (const walletDoc of walletSnap.docs) {
            await updateDoc(walletDoc.ref, {
              status: "pending_auto_release",
              completedAt: Timestamp.now(),
              autoReleaseAt: Timestamp.fromDate(
                new Date(Date.now() + 24 * 60 * 60 * 1000),
              ),
              updatedAt: Timestamp.now(),
            });
          }
        } catch (walletErr) {
          console.error("Error updating wallet release schedule:", walletErr);
        }
      }

      // Send notification to patient based on status
      let title = "";
      let body = "";

      switch (status) {
        case "accepted":
          title = "Test Request Accepted";
          body = `${request.labName} has accepted your ${request.testType} test for ${request.scheduledDate}`;
          break;
        case "sample_collected":
          title = "Sample Collected";
          body = `Your sample for ${request.testType} has been collected and sent for processing`;
          break;
        case "processing":
          title = "Test In Progress";
          body = `Your ${request.testType} test is being processed at ${request.labName}`;
          break;
        case "report_ready":
          title = "Report Ready";
          body = `Your ${request.testType} report is ready. Check your medical records.`;
          break;
        case "completed":
          title = "Test Completed";
          body = `Your ${request.testType} test has been completed. View your report in Medical Records.`;
          break;
        case "cancelled":
          title = "Test Request Cancelled";
          body = `Your ${request.testType} test request has been cancelled.`;
          break;
      }

      if (title && body) {
        await NotificationService.createNotification(
          request.userId,
          "order",
          title,
          body,
          {
            testRequestId: requestId,
            labId: request.labId,
            labName: request.labName,
            status,
          },
        );
      }
    } catch (error) {
      console.error("Error updating test request status:", error);
      throw error;
    }
  }

  // Assign delivery boy to test request
  async assignDeliveryBoy(
    requestId: string,
    deliveryId: string,
    deliveryName: string,
    labId: string,
    labName: string,
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, requestId), {
        deliveryId,
        deliveryName,
        updatedAt: Timestamp.now(),
      });

      // Notify the delivery boy
      await NotificationService.createNotification(
        deliveryId,
        "order",
        "New Delivery Assignment",
        `${labName} has assigned you to collect a sample for a lab test.`,
        {
          testRequestId: requestId,
          labId,
          labName,
        },
      );

      // Notify the patient
      const request = await this.getTestRequestById(requestId);
      if (request) {
        await NotificationService.createNotification(
          request.userId,
          "order",
          "Delivery Assigned",
          `A delivery person has been assigned for your home sampling.`,
          {
            testRequestId: requestId,
            deliveryId,
            deliveryName,
          },
        );
      }
    } catch (error) {
      console.error("Error assigning delivery boy:", error);
      throw error;
    }
  }

  // Get a single test request by ID
  async getTestRequestById(requestId: string): Promise<LabTestRequest | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, requestId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...(docSnap.data() as Omit<LabTestRequest, "id">),
        } as LabTestRequest;
      }
      return null;
    } catch (error) {
      console.error("Error fetching test request:", error);
      throw error;
    }
  }

  // Listen to patient's test requests
  listenToUserTestRequests(
    userId: string,
    callback: (requests: LabTestRequest[]) => void,
  ) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
      );

      return onSnapshot(q, (snapshot) => {
        const requests: LabTestRequest[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<LabTestRequest, "id">),
          }))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        callback(requests);
      });
    } catch (error) {
      console.error("Error listening to user test requests:", error);
      throw error;
    }
  }

  // Listen to lab's test requests
  listenToLabTestRequests(
    labId: string,
    callback: (requests: LabTestRequest[]) => void,
  ) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("labId", "==", labId),
      );

      return onSnapshot(q, (snapshot) => {
        const requests: LabTestRequest[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<LabTestRequest, "id">),
          }))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        callback(requests);
      });
    } catch (error) {
      console.error("Error listening to lab test requests:", error);
      throw error;
    }
  }

  // Get lab's test requests (one-time fetch)
  async getLabTestRequests(labId: string): Promise<LabTestRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("labId", "==", labId),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<LabTestRequest, "id">),
      }));
    } catch (error) {
      console.error("Error getting lab test requests:", error);
      throw error;
    }
  }

  // Upload report for a test request
  async uploadReport(
    requestId: string,
    request: LabTestRequest,
    reportUrl: string,
    reportNotes?: string,
  ): Promise<void> {
    try {
      await this.updateTestRequestStatus(requestId, "report_ready", request, {
        reportUrl,
        reportNotes,
      });
    } catch (error) {
      console.error("Error uploading report:", error);
      throw error;
    }
  }

  // Cancel test request
  async cancelTestRequest(
    requestId: string,
    request: LabTestRequest,
  ): Promise<void> {
    try {
      await this.updateTestRequestStatus(requestId, "cancelled", request);
    } catch (error) {
      console.error("Error cancelling test request:", error);
      throw error;
    }
  }

  // Listen to delivery boy's assigned lab test requests (home sampling)
  listenToDeliveryLabTestRequests(
    deliveryId: string,
    callback: (requests: LabTestRequest[]) => void,
  ) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("deliveryId", "==", deliveryId),
        where("collectionType", "==", "home_sampling"),
      );

      return onSnapshot(q, (snapshot) => {
        const requests: LabTestRequest[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<LabTestRequest, "id">),
          }))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        callback(requests);
      });
    } catch (error) {
      console.error("Error listening to delivery lab test requests:", error);
      throw error;
    }
  }

  // Update payment status for a test request
  async updatePaymentStatus(
    requestId: string,
    paymentStatus: LabTestRequest["paymentStatus"],
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, requestId), {
        paymentStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }

  // Assign delivery boy to a home sampling request
  async assignDeliveryToRequest(
    requestId: string,
    request: LabTestRequest,
    deliveryId: string,
    deliveryName: string,
  ): Promise<void> {
    try {
      // Get delivery boy details
      const deliveryDoc = await getDoc(doc(db, "users", deliveryId));
      const deliveryData = deliveryDoc.data();
      const deliveryPhone = deliveryData?.phone || "";

      const updateData: any = {
        deliveryId,
        deliveryName,
        deliveryPhone,
        updatedAt: Timestamp.now(),
      };

      // If it's pending, automatically mark as accepted when assigned
      if (request.status === "pending") {
        updateData.status = "accepted";
      }

      await updateDoc(doc(db, this.collectionName, requestId), updateData);

      // Create appointment for the delivery boy
      const appointmentData = {
        userId: request.userId,
        userName: request.userName,
        deliveryId: deliveryId,
        deliveryName: deliveryName,
        providerType: "delivery" as const,
        appointmentDate: request.scheduledDate,
        appointmentTime: request.scheduledTime,
        status: "pending" as const,
        serviceType: "Lab Home Sampling",
        notes: `Lab: ${request.labName}. Tests: ${request.testType}. Order ID: ${requestId}`,
        address: request.address || "",
        paymentMethod: (request.paymentMethod as any) || "cash",
        labTestRequestId: requestId,
      };

      // We use a dynamic import or just call addDoc here to avoid circular dependency if AppointmentService imports LabTestService
      await addDoc(collection(db, "appointments"), {
        ...appointmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify the delivery boy
      await NotificationService.createNotification(
        deliveryId,
        "appointment",
        "New Lab Sampling Assignment",
        `You have been assigned to collect samples for ${request.userName} (${request.testType})`,
        {
          testRequestId: requestId,
          userId: request.userId,
          userName: request.userName,
          labName: request.labName,
        },
      );

      // Notify the patient
      await NotificationService.createNotification(
        request.userId,
        "appointment",
        "Delivery Boy Assigned",
        `Your lab test delivery has been assigned to ${deliveryName}. Contact: ${deliveryPhone}`,
        {
          testRequestId: requestId,
          deliveryId: deliveryId,
          deliveryName: deliveryName,
          deliveryPhone: deliveryPhone,
          labName: request.labName,
        },
      );
    } catch (error) {
      console.error("Error assigning delivery boy:", error);
      throw error;
    }
  }
}

export default new LabTestService();
