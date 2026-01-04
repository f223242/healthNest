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
    where
} from "firebase/firestore";
import NotificationService from "./NotificationService";

// Payment Types
export type PaymentMethod = "card" | "bnpl" | "wallet" | "cash";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type BNPLStatus = "pending" | "approved" | "rejected" | "active" | "completed" | "defaulted";

// Payment Transaction Interface
export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  // Transaction details
  amount: number;
  currency: string;
  description: string;
  // Payment method
  method: PaymentMethod;
  // Card details (masked for security)
  cardLast4?: string;
  cardBrand?: string;
  // Related entity
  entityType: "appointment" | "lab_test" | "medicine" | "subscription" | "other";
  entityId: string;
  // Status
  status: PaymentStatus;
  // Gateway response (for testing)
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

// BNPL Application Interface
export interface BNPLApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  // Credit details
  requestedAmount: number;
  approvedAmount?: number;
  installments: number;
  interestRate: number;
  // Verification status
  identityVerified: boolean;
  incomeVerified: boolean;
  creditScore?: number;
  // Status
  status: BNPLStatus;
  // Payment schedule
  paymentSchedule?: BNPLInstallment[];
  // Admin review
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// BNPL Installment Interface
export interface BNPLInstallment {
  id: string;
  applicationId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Timestamp;
  paidDate?: Timestamp;
  status: "pending" | "paid" | "overdue" | "waived";
}

// Test Card Numbers (for testing mode)
export const TEST_CARDS = {
  success: {
    number: "4242424242424242",
    name: "Test Success Card",
    expiry: "12/28",
    cvv: "123",
  },
  decline: {
    number: "4000000000000002",
    name: "Test Decline Card",
    expiry: "12/28",
    cvv: "123",
  },
  insufficientFunds: {
    number: "4000000000009995",
    name: "Insufficient Funds",
    expiry: "12/28",
    cvv: "123",
  },
};

class PaymentService {
  private paymentsCollection = "payments";
  private bnplCollection = "bnplApplications";
  private installmentsCollection = "bnplInstallments";
  
  // Test mode flag
  private isTestMode = true;

  // ==================== PAYMENT METHODS ====================

  // Process a payment (Test Mode)
  async processPayment(
    userId: string,
    userName: string,
    amount: number,
    method: PaymentMethod,
    entityType: PaymentTransaction["entityType"],
    entityId: string,
    description: string,
    cardDetails?: { number: string; expiry: string; cvv: string; name: string }
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    try {
      // Create pending transaction
      const transactionRef = await addDoc(collection(db, this.paymentsCollection), {
        userId,
        userName,
        amount,
        currency: "PKR",
        description,
        method,
        cardLast4: cardDetails?.number.slice(-4),
        cardBrand: this.detectCardBrand(cardDetails?.number || ""),
        entityType,
        entityId,
        status: "processing",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Simulate payment processing in test mode
      if (this.isTestMode) {
        const result = await this.simulatePayment(cardDetails?.number || "", amount);
        
        // Update transaction status
        await updateDoc(transactionRef, {
          status: result.success ? "completed" : "failed",
          gatewayTransactionId: result.transactionId,
          gatewayResponse: result,
          updatedAt: Timestamp.now(),
          completedAt: result.success ? Timestamp.now() : null,
        });

        // Send notification
        if (result.success) {
          await NotificationService.createNotification(
            userId,
            "order",
            "Payment Successful",
            `Your payment of PKR ${amount} has been processed successfully.`,
            { transactionId: transactionRef.id, entityType, entityId }
          );
        }

        return {
          success: result.success,
          transactionId: transactionRef.id,
          message: result.message,
        };
      }

      // Production payment gateway integration would go here
      return {
        success: false,
        transactionId: transactionRef.id,
        message: "Production payment not configured",
      };
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  }

  // Simulate payment for testing
  private async simulatePayment(
    cardNumber: string,
    amount: number
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check test card scenarios
    if (cardNumber === TEST_CARDS.decline.number) {
      return {
        success: false,
        transactionId,
        message: "Card declined. Please try a different card.",
      };
    }

    if (cardNumber === TEST_CARDS.insufficientFunds.number) {
      return {
        success: false,
        transactionId,
        message: "Insufficient funds. Please check your balance.",
      };
    }

    // Default: success
    return {
      success: true,
      transactionId,
      message: "Payment processed successfully.",
    };
  }

  // Detect card brand from number
  private detectCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith("4")) return "Visa";
    if (cardNumber.startsWith("5")) return "Mastercard";
    if (cardNumber.startsWith("3")) return "Amex";
    return "Unknown";
  }

  // Get user's payment history
  async getUserPayments(userId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.paymentsCollection),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PaymentTransaction, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting user payments:", error);
      throw error;
    }
  }

  // Listen to user's payments
  listenToUserPayments(
    userId: string,
    callback: (payments: PaymentTransaction[]) => void
  ) {
    const q = query(
      collection(db, this.paymentsCollection),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const payments: PaymentTransaction[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PaymentTransaction, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(payments);
    });
  }

  // ==================== BNPL METHODS ====================

  // Apply for BNPL
  async applyForBNPL(
    userId: string,
    userName: string,
    userEmail: string,
    userPhone: string,
    requestedAmount: number,
    installments: number
  ): Promise<string> {
    try {
      // Calculate interest rate based on installments
      const interestRate = this.calculateInterestRate(installments);

      const docRef = await addDoc(collection(db, this.bnplCollection), {
        userId,
        userName,
        userEmail,
        userPhone,
        requestedAmount,
        installments,
        interestRate,
        identityVerified: false,
        incomeVerified: false,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify admin
      await NotificationService.createNotification(
        "admin", // Admin user ID
        "order",
        "New BNPL Application",
        `${userName} has applied for BNPL credit of PKR ${requestedAmount}`,
        { applicationId: docRef.id }
      );

      return docRef.id;
    } catch (error) {
      console.error("Error applying for BNPL:", error);
      throw error;
    }
  }

  // Calculate interest rate based on installments
  private calculateInterestRate(installments: number): number {
    if (installments <= 3) return 0; // 0% for 3 months or less
    if (installments <= 6) return 5; // 5% for 4-6 months
    if (installments <= 12) return 10; // 10% for 7-12 months
    return 15; // 15% for more than 12 months
  }

  // Admin: Approve BNPL application
  async approveBNPL(
    applicationId: string,
    approvedAmount: number,
    adminId: string
  ): Promise<void> {
    try {
      const appRef = doc(db, this.bnplCollection, applicationId);
      const appSnap = await getDoc(appRef);

      if (!appSnap.exists()) throw new Error("Application not found");

      const appData = appSnap.data() as BNPLApplication;

      // Generate payment schedule
      const schedule = this.generatePaymentSchedule(
        applicationId,
        approvedAmount,
        appData.installments,
        appData.interestRate
      );

      // Update application
      await updateDoc(appRef, {
        status: "approved",
        approvedAmount,
        paymentSchedule: schedule,
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create installment documents
      for (const installment of schedule) {
        await addDoc(collection(db, this.installmentsCollection), installment);
      }

      // Notify user
      await NotificationService.createNotification(
        appData.userId,
        "order",
        "BNPL Application Approved!",
        `Your BNPL application for PKR ${approvedAmount} has been approved.`,
        { applicationId }
      );
    } catch (error) {
      console.error("Error approving BNPL:", error);
      throw error;
    }
  }

  // Admin: Reject BNPL application
  async rejectBNPL(
    applicationId: string,
    reason: string,
    adminId: string
  ): Promise<void> {
    try {
      const appRef = doc(db, this.bnplCollection, applicationId);
      const appSnap = await getDoc(appRef);

      if (!appSnap.exists()) throw new Error("Application not found");

      const appData = appSnap.data() as BNPLApplication;

      await updateDoc(appRef, {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: adminId,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Notify user
      await NotificationService.createNotification(
        appData.userId,
        "order",
        "BNPL Application Update",
        `Your BNPL application has been reviewed. Reason: ${reason}`,
        { applicationId }
      );
    } catch (error) {
      console.error("Error rejecting BNPL:", error);
      throw error;
    }
  }

  // Generate payment schedule
  private generatePaymentSchedule(
    applicationId: string,
    amount: number,
    installments: number,
    interestRate: number
  ): Omit<BNPLInstallment, "id">[] {
    const totalAmount = amount * (1 + interestRate / 100);
    const installmentAmount = Math.ceil(totalAmount / installments);

    const schedule: Omit<BNPLInstallment, "id">[] = [];
    const now = new Date();

    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        applicationId,
        installmentNumber: i,
        amount: i === installments ? totalAmount - installmentAmount * (installments - 1) : installmentAmount,
        dueDate: Timestamp.fromDate(dueDate),
        status: "pending",
      });
    }

    return schedule;
  }

  // Get user's BNPL applications
  async getUserBNPLApplications(userId: string): Promise<BNPLApplication[]> {
    try {
      const q = query(
        collection(db, this.bnplCollection),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<BNPLApplication, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (error) {
      console.error("Error getting BNPL applications:", error);
      throw error;
    }
  }

  // Admin: Get all BNPL applications
  listenToBNPLApplications(callback: (applications: BNPLApplication[]) => void) {
    const q = query(collection(db, this.bnplCollection));

    return onSnapshot(q, (snapshot) => {
      const applications: BNPLApplication[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<BNPLApplication, "id">),
        }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(applications);
    });
  }

  // Get user's installments
  async getUserInstallments(userId: string): Promise<BNPLInstallment[]> {
    try {
      // First get user's BNPL applications
      const apps = await this.getUserBNPLApplications(userId);
      const appIds = apps.map((app) => app.id);

      if (appIds.length === 0) return [];

      const allInstallments: BNPLInstallment[] = [];

      for (const appId of appIds) {
        const q = query(
          collection(db, this.installmentsCollection),
          where("applicationId", "==", appId)
        );

        const snapshot = await getDocs(q);
        const installments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<BNPLInstallment, "id">),
        }));

        allInstallments.push(...installments);
      }

      return allInstallments.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis());
    } catch (error) {
      console.error("Error getting user installments:", error);
      throw error;
    }
  }

  // Pay an installment
  async payInstallment(
    installmentId: string,
    userId: string,
    userName: string,
    cardDetails: { number: string; expiry: string; cvv: string; name: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const installmentRef = doc(db, this.installmentsCollection, installmentId);
      const installmentSnap = await getDoc(installmentRef);

      if (!installmentSnap.exists()) throw new Error("Installment not found");

      const installment = installmentSnap.data() as BNPLInstallment;

      // Process payment
      const result = await this.processPayment(
        userId,
        userName,
        installment.amount,
        "card",
        "other",
        installmentId,
        `BNPL Installment ${installment.installmentNumber}`,
        cardDetails
      );

      if (result.success) {
        await updateDoc(installmentRef, {
          status: "paid",
          paidDate: Timestamp.now(),
        });
      }

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error("Error paying installment:", error);
      throw error;
    }
  }

  // Refund a payment
  async refundPayment(
    transactionId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const transactionRef = doc(db, this.paymentsCollection, transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) throw new Error("Transaction not found");

      const transaction = transactionSnap.data() as PaymentTransaction;

      if (transaction.status !== "completed") {
        return { success: false, message: "Only completed payments can be refunded" };
      }

      // In test mode, simulate refund
      if (this.isTestMode) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await updateDoc(transactionRef, {
          status: "refunded",
          gatewayResponse: { ...transaction.gatewayResponse, refundReason: reason },
          updatedAt: Timestamp.now(),
        });

        // Notify user
        await NotificationService.createNotification(
          transaction.userId,
          "order",
          "Payment Refunded",
          `Your payment of PKR ${transaction.amount} has been refunded.`,
          { transactionId }
        );

        return { success: true, message: "Refund processed successfully" };
      }

      return { success: false, message: "Production refund not configured" };
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  }

  // Alias methods for admin screens
  listenToAllBNPLApplications(callback: (applications: BNPLApplication[]) => void) {
    return this.listenToBNPLApplications(callback);
  }

  async adminApproveBNPL(applicationId: string, adminId: string, approvedAmount: number): Promise<void> {
    return this.approveBNPL(applicationId, approvedAmount, adminId);
  }

  async adminRejectBNPL(applicationId: string, adminId: string, reason: string): Promise<void> {
    return this.rejectBNPL(applicationId, reason, adminId);
  }
}

export default new PaymentService();
