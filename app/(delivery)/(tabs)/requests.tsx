import AppointmentCard from "@/component/AppointmentCard";
import ConfirmationModal from "@/component/ModalComponent/ConfirmationModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService, { Appointment } from "@/services/AppointmentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryRequests = () => {
    const { user } = useAuthContext();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed">("pending");
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
                    toast.success("Request accepted!");
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
                <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={["top"]}>
                    <Animatable.View animation="fadeInDown" style={styles.header}>
                        <Text style={styles.headerTitle}>Delivery Requests</Text>
                        <Text style={styles.headerSubtitle}>
                            Manage your incoming delivery requests
                        </Text>
                    </Animatable.View>

                    {/* Stats Cards */}
                    <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="time-outline" size={24} color="#FF9800" />
                            <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.accepted}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="trophy-outline" size={24} color="#2196F3" />
                            <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>Done</Text>
                        </View>
                    </Animatable.View>
                </SafeAreaView>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { label: "Pending", value: "pending" as const, icon: "time-outline" },
                        { label: "Active", value: "accepted" as const, icon: "checkmark-circle-outline" },
                        { label: "Completed", value: "completed" as const, icon: "checkmark-done-outline" },
                        { label: "All", value: "all" as const, icon: "list-outline" },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.value}
                            style={[
                                styles.filterTab,
                                filter === tab.value && styles.filterTabActive,
                            ]}
                            onPress={() => setFilter(tab.value)}
                        >
                            <Ionicons 
                                name={tab.icon as any} 
                                size={16} 
                                color={filter === tab.value ? colors.white : colors.gray} 
                            />
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
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {filteredAppointments.length === 0 ? (
                    <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="clipboard-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>No Requests</Text>
                        <Text style={styles.emptySubtitle}>
                            {filter === "pending"
                                ? "No pending requests at the moment"
                                : filter === "accepted"
                                ? "No active deliveries"
                                : filter === "completed"
                                ? "No completed deliveries yet"
                                : "You don't have any delivery requests"}
                        </Text>
                    </Animatable.View>
                ) : (
                    filteredAppointments.map((appointment, index) => (
                        <Animatable.View 
                            key={appointment.id} 
                            animation="fadeInUp" 
                            delay={index * 100}
                        >
                            <AppointmentCard
                                appointment={appointment}
                                isProvider={true}
                                providerType="delivery"
                                onAccept={() => handleAcceptAppointment(appointment)}
                                onReject={() => handleRejectAppointment(appointment)}
                                onComplete={() => handleCompleteAppointment(appointment)}
                            />
                        </Animatable.View>
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

export default DeliveryRequests;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
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
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: sizes.paddingHorizontal,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: sizes.paddingHorizontal,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontFamily: Fonts.bold,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: colors.gray,
        marginTop: 4,
    },
    filterContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: sizes.paddingHorizontal,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E8ECF0",
    },
    filterTab: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: "#F0F2F5",
        gap: 6,
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
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.lightGreen,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: colors.text,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.gray,
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 40,
    },
});
