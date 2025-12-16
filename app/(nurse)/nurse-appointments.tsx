import AppointmentCard from "@/component/AppointmentCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService, { Appointment } from "@/services/AppointmentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NurseAppointments = () => {
    const router = useRouter();
    const { user } = useAuthContext();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed">("all");

    useEffect(() => {
        if (!user) return;

        const unsubscribe = AppointmentService.listenToNurseAppointments(
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
        Alert.alert(
            "Accept Appointment",
            `Accept appointment with ${appointment.userName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Accept",
                    onPress: async () => {
                        try {
                            await AppointmentService.updateAppointmentStatus(
                                appointment.id,
                                "accepted",
                                appointment
                            );
                            Alert.alert("Success", "Appointment accepted successfully");
                        } catch (error) {
                            console.error("Error accepting appointment:", error);
                            Alert.alert("Error", "Failed to accept appointment");
                        }
                    },
                },
            ]
        );
    };

    const handleRejectAppointment = async (appointment: Appointment) => {
        Alert.alert(
            "Reject Appointment",
            `Reject appointment with ${appointment.userName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AppointmentService.updateAppointmentStatus(
                                appointment.id,
                                "rejected",
                                appointment
                            );
                            Alert.alert("Rejected", "Appointment has been rejected");
                        } catch (error) {
                            console.error("Error rejecting appointment:", error);
                            Alert.alert("Error", "Failed to reject appointment");
                        }
                    },
                },
            ]
        );
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
                <Text style={styles.loadingText}>Loading appointments...</Text>
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
                        <Text style={styles.headerTitle}>My Appointments</Text>
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

            {/* Appointments List */}
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
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            userType="nurse"
                            onAccept={() => handleAcceptAppointment(appointment)}
                            onReject={() => handleRejectAppointment(appointment)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={colors.gray} />
                        <Text style={styles.emptyTitle}>No Appointments</Text>
                        <Text style={styles.emptyText}>
                            {filter === "all"
                                ? "You don't have any appointments yet"
                                : `No ${filter} appointments found`}
                        </Text>
                    </View>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

export default NurseAppointments;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: colors.gray,
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: sizes.paddingHorizontal,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: sizes.paddingHorizontal,
        marginTop: 20,
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
        fontFamily: Fonts.regular,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    filterContainer: {
        paddingVertical: 16,
        paddingHorizontal: sizes.paddingHorizontal,
        backgroundColor: colors.white,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.background,
        marginRight: 12,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterTabText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: colors.text,
    },
    filterTabTextActive: {
        color: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: sizes.paddingHorizontal,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.gray,
        textAlign: "center",
    },
});
