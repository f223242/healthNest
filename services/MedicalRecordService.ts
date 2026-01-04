import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";

export type RecordType = "lab_report" | "prescription" | "diagnosis" | "imaging" | "other";
export type RecordStatus = "new" | "viewed" | "pending" | "processing" | "ready" | "sent" | "delivered" | "completed";

export interface MedicalRecord {
  id: string;
  // Owner info
  userId: string;
  userName: string;
  // Patient info (for lab/provider use)
  patientName?: string;
  patientPhone?: string;
  // Record details
  type: RecordType;
  title: string;
  description?: string;
  // Provider info
  providerId: string;
  providerName: string;
  providerImage?: string;
  providerType: "lab" | "nurse" | "doctor" | "other";
  // Medical details
  doctorName?: string;
  diagnosis?: string;
  notes?: string;
  // Collection type (for lab reports)
  collectionType?: "home" | "lab";
  // Files
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  // Related entities
  testRequestId?: string;
  appointmentId?: string;
  // Status
  status: RecordStatus;
  // Timestamps
  date: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class MedicalRecordService {
  private collectionName = "medicalRecords";

  // Create a new medical record
  async createRecord(
    data: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt" | "status">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        status: "new",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating medical record:", error);
      throw error;
    }
  }

  // Listen to user's medical records
  listenToUserRecords(
    userId: string,
    callback: (records: MedicalRecord[]) => void
  ) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId)
      );

      return onSnapshot(q, (snapshot) => {
        const records: MedicalRecord[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MedicalRecord, "id">),
          }))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        callback(records);
      });
    } catch (error) {
      console.error("Error listening to medical records:", error);
      throw error;
    }
  }

  // Get user's medical records (one-time fetch)
  async getUserRecords(userId: string): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MedicalRecord, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting medical records:", error);
      throw error;
    }
  }

  // Mark record as viewed
  async markAsViewed(recordId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, recordId), {
        status: "viewed",
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error marking record as viewed:", error);
      throw error;
    }
  }

  // Update record
  async updateRecord(
    recordId: string,
    data: Partial<MedicalRecord>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, recordId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating medical record:", error);
      throw error;
    }
  }

  // Delete record
  async deleteRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, recordId));
    } catch (error) {
      console.error("Error deleting medical record:", error);
      throw error;
    }
  }

  // Get records by type
  async getRecordsByType(
    userId: string,
    type: RecordType
  ): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("type", "==", type)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MedicalRecord, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting records by type:", error);
      throw error;
    }
  }

  // Get new (unviewed) records count
  async getNewRecordsCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("status", "==", "new")
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting new records count:", error);
      return 0;
    }
  }

  // Listen to lab records (for lab provider view)
  listenToLabRecords(
    labId: string,
    callback: (records: MedicalRecord[]) => void
  ) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("providerId", "==", labId),
        where("providerType", "==", "lab")
      );

      return onSnapshot(q, (snapshot) => {
        const records: MedicalRecord[] = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MedicalRecord, "id">),
          }))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        callback(records);
      });
    } catch (error) {
      console.error("Error listening to lab records:", error);
      throw error;
    }
  }

  // Update record status
  async updateRecordStatus(
    recordId: string,
    status: RecordStatus
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, recordId), {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating record status:", error);
      throw error;
    }
  }
}

export default new MedicalRecordService();
