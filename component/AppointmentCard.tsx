import { colors, Fonts } from "@/constant/theme";
import { Appointment, AppointmentStatus } from "@/services/AppointmentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AppointmentCardProps {
    appointment: Appointment;
    userType?: "user" | "nurse"; // To show different views (legacy support)
    isProvider?: boolean; // New: true if viewing as provider (nurse/delivery)
    providerType?: "nurse" | "delivery" | "lab"; // New: type of provider
    onAccept?: () => void;
    onReject?: () => void;
    onCancel?: () => void;
    onComplete?: () => void;
    onMarkCashCollected?: () => void;
    onPress?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    userType,
    isProvider,
    providerType,
    onAccept,
    onReject,
    onCancel,
    onComplete,
    onMarkCashCollected,
    onPress,
}) => {
    // Determine if viewing as provider (supports both old and new interface)
    const isProviderView = isProvider ?? (userType === "nurse");
    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case "pending":
                return "#FF9800";
            case "accepted":
                return colors.success;
            case "rejected":
                return "#F44336";
            case "completed":
                return "#2196F3";
            case "cancelled":
                return colors.gray;
            default:
                return colors.gray;
        }
    };

    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case "pending":
                return "time";
            case "accepted":
                return "checkmark-circle";
            case "rejected":
                return "close-circle";
            case "completed":
                return "checkmark-done-circle";
            case "cancelled":
                return "ban";
            default:
                return "help-circle";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const providerName = appointment.nurseName ?? (appointment as any).deliveryName ?? "";
    const providerImage = appointment.nurseImage ?? (appointment as any).deliveryImage ?? "";
    const providerRole = appointment.nurseSpecialization ?? (appointment.providerType === "delivery" ? "Delivery" : "Provider");

    const displayName = userType === "user" ? providerName : appointment.userName;
    const displayImage = userType === "user" ? providerImage : appointment.userImage;
    const displayRole = userType === "user" ? providerRole : "Patient";

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.cardGradient}
            >
                {/* Status Badge */}
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) },
                    ]}
                >
                    <Ionicons
                        name={getStatusIcon(appointment.status)}
                        size={14}
                        color={colors.white}
                    />
                    <Text style={styles.statusText}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Text>
                </View>

                <View style={styles.cardContent}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            {displayImage ? (
                                <Image source={{ uri: displayImage }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={28} color={colors.white} />
                                </View>
                            )}
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{displayName}</Text>
                            <Text style={styles.role}>{displayRole}</Text>
                            <View style={styles.serviceTypeContainer}>
                                <Ionicons name="medical" size={14} color={colors.primary} />
                                <Text style={styles.serviceType}>{appointment.serviceType}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Appointment Details */}
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={16} color={colors.primary} />
                            <Text style={styles.detailText}>{formatDate(appointment.appointmentDate)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="time" size={16} color={colors.primary} />
                            <Text style={styles.detailText}>{formatTime(appointment.appointmentTime)}</Text>
                        </View>

                        {appointment.duration && (
                            <View style={styles.detailRow}>
                                <Ionicons name="hourglass" size={16} color={colors.primary} />
                                <Text style={styles.detailText}>{appointment.duration}</Text>
                            </View>
                        )}

                        {appointment.address && (
                            <View style={styles.detailRow}>
                                <Ionicons name="location" size={16} color={colors.primary} />
                                <Text style={styles.detailText} numberOfLines={1}>
                                    {appointment.address}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Notes if available */}
                    {appointment.notes && (
                        <View style={styles.notesSection}>
                            <Text style={styles.notesLabel}>Notes:</Text>
                            <Text style={styles.notesText} numberOfLines={2}>
                                {appointment.notes}
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons for Provider (Nurse/Delivery) */}
                    {isProviderView && appointment.status === "pending" && (
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={onReject}
                            >
                                <Ionicons name="close" size={18} color="#F44336" />
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={onAccept}
                            >
                                <Ionicons name="checkmark" size={18} color={colors.white} />
                                <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Complete Button for Provider with accepted appointments */}
                    {isProviderView && appointment.status === "accepted" && onComplete && (
                        <View style={styles.actionsContainer}>
                            {/* Cash Collection Button - Only for cash payments */}
                            {appointment.paymentMethod === "cash" && onMarkCashCollected && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cashButton]}
                                    onPress={onMarkCashCollected}
                                >
                                    <Ionicons name="cash" size={18} color="#2E7D32" />
                                    <Text style={styles.cashButtonText}>Mark Cash Collected</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton, { flex: 1.5 }]}
                                onPress={onComplete}
                            >
                                <Ionicons name="checkmark-done" size={18} color={colors.white} />
                                <Text style={styles.acceptButtonText}>Mark Complete</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Cancel Button for User */}
                    {userType === "user" &&
                        (appointment.status === "pending" || appointment.status === "accepted") && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}
                            >
                                <Ionicons name="close-circle" size={16} color="#F44336" />
                                <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                            </TouchableOpacity>
                        )}

                    {/* Price Info */}
                    {appointment.hourlyRate && (
                        <View style={styles.priceContainer}>
                            <Ionicons name="cash" size={16} color={colors.success} />
                            <Text style={styles.priceText}>Rs. {appointment.hourlyRate}/hour</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default AppointmentCard;

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardGradient: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statusBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
        zIndex: 1,
    },
    statusText: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        color: colors.white,
    },
    cardContent: {
        padding: 16,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingRight: 80, // Space for status badge
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: colors.text,
        marginBottom: 2,
    },
    role: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.gray,
        marginBottom: 4,
    },
    serviceTypeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    serviceType: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: colors.primary,
    },
    detailsSection: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.text,
        flex: 1,
    },
    notesSection: {
        backgroundColor: "#FFF8E1",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: "#FF9800",
    },
    notesLabel: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#F57C00",
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: "#795548",
        lineHeight: 18,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    rejectButton: {
        backgroundColor: "#FFEBEE",
        borderWidth: 1,
        borderColor: "#F44336",
    },
    rejectButtonText: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: "#F44336",
    },
    acceptButton: {
        backgroundColor: colors.success,
    },
    acceptButtonText: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        color: colors.white,
    },
    cancelButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#FFEBEE",
        borderWidth: 1,
        borderColor: "#F44336",
        gap: 6,
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: "#F44336",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        marginTop: 8,
    },
    priceText: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: colors.success,
    },
    cashButton: {
        backgroundColor: "#E8F5E9",
        borderWidth: 1,
        borderColor: "#2E7D32",
        flex: 1,
    },
    cashButtonText: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: "#2E7D32",
    },
});
