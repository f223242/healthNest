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
    nurseId: string; // Nurse ID
    userName: string;
    nurseName: string;
    userImage?: string;
    nurseImage?: string;
    nurseSpecialization: string;
    appointmentDate: string; // Date in format YYYY-MM-DD
    appointmentTime: string; // Time in format HH:MM
    status: AppointmentStatus;
    serviceType: string; // e.g., "Elderly Care", "Child Care", etc.
    notes?: string; // Additional notes from user
    address?: string; // Service location
    duration?: string; // e.g., "2 hours", "Full day"
    hourlyRate?: string;
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

            // Send notification to nurse
            await NotificationService.createNotification(
                appointmentData.nurseId,
                "appointment",
                "New Appointment Request",
                `${appointmentData.userName} has requested an appointment for ${appointmentData.serviceType}`,
                {
                    appointmentId: docRef.id,
                    userId: appointmentData.userId,
                    userName: appointmentData.userName,
                    appointmentDate: appointmentData.appointmentDate,
                    appointmentTime: appointmentData.appointmentTime,
                }
            );

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

            if (status === "accepted") {
                title = "Appointment Accepted";
                body = `${appointment.nurseName} has accepted your appointment request for ${appointment.appointmentDate} at ${appointment.appointmentTime}`;
            } else if (status === "rejected") {
                title = "Appointment Declined";
                body = `${appointment.nurseName} has declined your appointment request. Please try booking with another nurse.`;
            } else if (status === "completed") {
                title = "Appointment Completed";
                body = `Your appointment with ${appointment.nurseName} has been completed.`;
            } else if (status === "cancelled") {
                title = "Appointment Cancelled";
                body = `Your appointment with ${appointment.nurseName} has been cancelled.`;
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
                        status,
                    }
                );
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
