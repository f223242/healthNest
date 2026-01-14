import AppointmentCard from "@/component/AppointmentCard";
import ConfirmationModal from "@/component/ModalComponent/ConfirmationModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService, { Appointment } from "@/services/AppointmentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryAppointments = () => {
    const router = useRouter();
    const { user } = useAuthContext();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed">("all");
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "success" as "success" | "danger" | "warning"
    });
    const toast = useToast();

    useEffect(() => {
        if (!user) return;

        // Listen to delivery appointments
        const unsubscribe = AppointmentService.listenToDeliveryAppointments(
            user.uid,
            (fetchedAppointments) => {
                setAppointments(fetchedAppointments);
                setLoading(false);
                setRefreshing(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleAcceptAppointment = async (appointment: Appointment) => {
        setConfirmModal({
            visible: true,
            title: "Accept Request",
            message: `Accept delivery request from ${appointment.userName}?`,
            type: "success",
            onConfirm: async () => {
                try {
                    await AppointmentService.updateAppointmentStatus(
                        appointment.id,
                        "accepted",
                        appointment
                    );
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.success("Request accepted successfully");
                } catch (error) {
                    console.error("Error accepting request:", error);
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.error("Failed to accept request");
                }
            }
        });
    };

    const handleRejectAppointment = async (appointment: Appointment) => {
        setConfirmModal({
            visible: true,
            title: "Reject Request",
            message: `Reject delivery request from ${appointment.userName}?`,
            type: "danger",
            onConfirm: async () => {
                try {
                    await AppointmentService.updateAppointmentStatus(
                        appointment.id,
                        "rejected",
                        appointment
                    );
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.success("Request rejected");
                } catch (error) {
                    console.error("Error rejecting request:", error);
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.error("Failed to reject request");
                }
            }
        });
    };

    const handleCompleteAppointment = async (appointment: Appointment) => {
        setConfirmModal({
            visible: true,
            title: "Complete Delivery",
            message: `Mark delivery to ${appointment.userName} as completed?`,
            type: "success",
            onConfirm: async () => {
                try {
                    await AppointmentService.updateAppointmentStatus(
                        appointment.id,
                        "completed",
                        appointment
                    );
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.success("Delivery completed!");
                } catch (error) {
                    console.error("Error completing delivery:", error);
                    setConfirmModal(prev => ({ ...prev, visible: false }));
                    toast.error("Failed to complete delivery");
                }
            }
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
    };

    const filteredAppointments = appointments.filter((apt) => {
        if (filter === "all") return true;
        return apt.status === filter;
    });

    const stats = {
        pending: appointments.filter((a) => a.status === "pending").length,
        accepted: appointments.filter((a) => a.status === "accepted").length,
        completed: appointments.filter((a) => a.status === "completed").length,
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header */}
            <LinearGradient
                colors={[colors.primary, "#00D68F"]}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Delivery Requests</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.accepted}</Text>
                            <Text style={styles.statLabel}>Accepted</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { label: "All", value: "all" as const },
                        { label: "Pending", value: "pending" as const },
                        { label: "Accepted", value: "accepted" as const },
                        { label: "Completed", value: "completed" as const },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.value}
                            style={[
                                styles.filterTab,
                                filter === tab.value && styles.filterTabActive,
                            ]}
                            onPress={() => setFilter(tab.value)}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    filter === tab.value && styles.filterTabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Requests List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {filteredAppointments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={64} color={colors.gray} />
                        <Text style={styles.emptyTitle}>No Requests</Text>
                        <Text style={styles.emptySubtitle}>
                            {filter === "all"
                                ? "You don't have any delivery requests yet"
                                : `No ${filter} requests found`}
                        </Text>
                    </View>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            isProvider={true}
                            providerType="delivery"
                            onAccept={() => handleAcceptAppointment(appointment)}
                            onReject={() => handleRejectAppointment(appointment)}
                            onComplete={() => handleCompleteAppointment(appointment)}
                        />
                    ))
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={confirmModal.visible}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

export default DeliveryAppointments;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.white,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: colors.gray,
    },
    headerGradient: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: sizes.paddingHorizontal,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: colors.white,
        textAlign: "center",
        marginRight: 40,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: sizes.paddingHorizontal,
        marginTop: 8,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    filterContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: sizes.paddingHorizontal,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E8ECF0",
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#F0F2F5",
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterTabText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: colors.gray,
    },
    filterTabTextActive: {
        color: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: sizes.paddingHorizontal,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: colors.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.gray,
        marginTop: 8,
        textAlign: "center",
    },
});
