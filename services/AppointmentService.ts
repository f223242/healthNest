import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import NotificationService from "./NotificationService";

export type AppointmentStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface Appointment {
    id: string;
    userId: string; // Patient/User ID
    // Provider (may be nurse or delivery)
    nurseId?: string;
    nurseName?: string;
    nurseImage?: string;
    nurseSpecialization?: string;
    deliveryId?: string;
    deliveryName?: string;
    deliveryImage?: string;
    providerType?: "nurse" | "delivery" | "lab" | "other";
    userName: string;
    userImage?: string;
    appointmentDate: string; // Date in format YYYY-MM-DD
    appointmentTime: string; // Time in format HH:MM
    status: AppointmentStatus;
    serviceType: string; // e.g., "Medicine Delivery", "Elderly Care"
    notes?: string; // Additional notes from user
    address?: string; // Service location
    duration?: string; // e.g., "2 hours", "Full day"
    hourlyRate?: string;
    // Payment & Order Tracking
    paymentMethod?: "card" | "cash" | "wallet" | "bnpl";
    labTestRequestId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

class AppointmentService {
    // Create new appointment
    async createAppointment(
        appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "appointments"), {
                ...appointmentData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            // Send notification to provider (nurse or delivery)
            const targetId = (appointmentData as any).nurseId ?? (appointmentData as any).deliveryId;
            const providerName = (appointmentData as any).nurseName ?? (appointmentData as any).deliveryName ?? "";
            const appointmentType = appointmentData.providerType ?? ((appointmentData as any).deliveryId ? "delivery" : "nurse");

            if (targetId) {
                await NotificationService.createNotification(
                    targetId,
                    "appointment",
                    "New Appointment Request",
                    `${appointmentData.userName} has requested a ${appointmentType} for ${appointmentData.serviceType}`,
                    {
                        appointmentId: docRef.id,
                        userId: appointmentData.userId,
                        userName: appointmentData.userName,
                        appointmentDate: appointmentData.appointmentDate,
                        appointmentTime: appointmentData.appointmentTime,
                        providerType: appointmentType,
                        providerName,
                    }
                );
            }

            return docRef.id;
        } catch (error) {
            console.error("Error creating appointment:", error);
            throw error;
        }
    }

    // Update appointment status
    async updateAppointmentStatus(
        appointmentId: string,
        status: AppointmentStatus,
        appointment: Appointment
    ): Promise<void> {
        try {
            await updateDoc(doc(db, "appointments", appointmentId), {
                status,
                updatedAt: Timestamp.now(),
            });

            // Send notification to user based on status
            let title = "";
            let body = "";

            const providerName = appointment.nurseName ?? (appointment as any).deliveryName ?? "";
            const appointmentType = appointment.providerType ?? ((appointment as any).deliveryId ? "delivery" : "nurse");

            if (status === "accepted") {
                title = "Appointment Accepted";
                body = `${providerName} has accepted your appointment request for ${appointment.appointmentDate} at ${appointment.appointmentTime}`;
            } else if (status === "rejected") {
                title = "Appointment Declined";
                body = `${providerName} has declined your appointment request. Please try booking with another provider.`;
            } else if (status === "completed") {
                title = "Appointment Completed";
                body = `Your appointment with ${providerName} has been completed.`;
            } else if (status === "cancelled") {
                title = "Appointment Cancelled";
                body = `Your appointment with ${providerName} has been cancelled.`;
            }

            if (title && body) {
                await NotificationService.createNotification(
                    appointment.userId,
                    "appointment",
                    title,
                    body,
                    {
                        appointmentId,
                        nurseId: appointment.nurseId,
                        nurseName: appointment.nurseName,
                        deliveryId: (appointment as any).deliveryId,
                        deliveryName: (appointment as any).deliveryName,
                        status,
                    }
                );

                // Notify admins when appointment is accepted
                if (status === "accepted") {
                    const providerId = appointment.nurseId ?? (appointment as any).deliveryId ?? "";
                    const providerType = appointment.providerType ?? ((appointment as any).deliveryId ? "delivery" : "nurse");
                    await NotificationService.notifyAllAdmins(
                        "appointment",
                        "Appointment Confirmed",
                        `${providerName} has been booked for ${appointment.appointmentDate} by ${appointment.userName}`,
                        {
                            appointmentId,
                            providerId,
                            providerType,
                        }
                    );
                }
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
            throw error;
        }
    }

    // Listen to user's appointments
    listenToUserAppointments(
        userId: string,
        callback: (appointments: Appointment[]) => void
    ) {
        try {
            const q = query(
                collection(db, "appointments"),
                where("userId", "==", userId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const appointments: Appointment[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Appointment, "id">),
                }));
                callback(appointments);
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error listening to user appointments:", error);
            throw error;
        }
    }

    // Listen to nurse's appointments
    listenToNurseAppointments(
        nurseId: string,
        callback: (appointments: Appointment[]) => void
    ) {
        try {
            const q = query(
                collection(db, "appointments"),
                where("nurseId", "==", nurseId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const appointments: Appointment[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Appointment, "id">),
                }));
                callback(appointments);
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error listening to nurse appointments:", error);
            throw error;
        }
    }

    // Get all appointments for a nurse (for checking availability)
    async getNurseAppointments(nurseId: string): Promise<Appointment[]> {
        try {
            const q = query(
                collection(db, "appointments"),
                where("nurseId", "==", nurseId),
                where("status", "in", ["pending", "accepted"])
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Appointment, "id">),
            }));
        } catch (error) {
            console.error("Error getting nurse appointments:", error);
            throw error;
        }
    }

    // Check if nurse is available for a specific date/time
    async checkNurseAvailability(
        nurseId: string,
        date: string,
        time: string
    ): Promise<boolean> {
        try {
            const appointments = await this.getNurseAppointments(nurseId);

            // Check if there's any conflicting appointment
            const hasConflict = appointments.some(
                (apt) =>
                    apt.appointmentDate === date &&
                    apt.appointmentTime === time &&
                    (apt.status === "accepted" || apt.status === "pending")
            );

            return !hasConflict;
        } catch (error) {
            console.error("Error checking nurse availability:", error);
            return false;
        }
    }

    // Get all appointments for a delivery person (for checking availability)
    async getDeliveryAppointments(deliveryId: string): Promise<Appointment[]> {
        try {
            const q = query(
                collection(db, "appointments"),
                where("deliveryId", "==", deliveryId),
                where("status", "in", ["pending", "accepted"])
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Appointment, "id">),
            }));
        } catch (error) {
            console.error("Error getting delivery appointments:", error);
            throw error;
        }
    }

    // Check if delivery person is available for a specific date/time
    async checkDeliveryAvailability(
        deliveryId: string,
        date: string,
        time: string
    ): Promise<boolean> {
        try {
            const appointments = await this.getDeliveryAppointments(deliveryId);

            const hasConflict = appointments.some(
                (apt) =>
                    apt.appointmentDate === date &&
                    apt.appointmentTime === time &&
                    (apt.status === "accepted" || apt.status === "pending")
            );

            return !hasConflict;
        } catch (error) {
            console.error("Error checking delivery availability:", error);
            return false;
        }
    }

    // Listen to delivery's appointments
    listenToDeliveryAppointments(
        deliveryId: string,
        callback: (appointments: Appointment[]) => void
    ) {
        try {
            const q = query(
                collection(db, "appointments"),
                where("deliveryId", "==", deliveryId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const appointments: Appointment[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Appointment, "id">),
                }));
                callback(appointments);
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error listening to delivery appointments:", error);
            throw error;
        }
    }

    // Check if user has an accepted appointment with delivery
    async checkAcceptedAppointmentForDelivery(userId: string, deliveryId: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, "appointments"),
                where("userId", "==", userId),
                where("deliveryId", "==", deliveryId),
                where("status", "==", "accepted")
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error("Error checking accepted appointment:", error);
            return false;
        }
    }

    // Check if user has an accepted appointment with nurse
    async checkAcceptedAppointment(userId: string, nurseId: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, "appointments"),
                where("userId", "==", userId),
                where("nurseId", "==", nurseId),
                where("status", "==", "accepted")
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error("Error checking accepted appointment:", error);
            return false;
        }
    }

    // Cancel appointment
    async cancelAppointment(appointmentId: string, appointment: Appointment): Promise<void> {
        try {
            await this.updateAppointmentStatus(appointmentId, "cancelled", appointment);
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            throw error;
        }
    }
}

export default new AppointmentService();
