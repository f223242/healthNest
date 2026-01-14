import { SearchIcon } from "@/assets/svg";
import AppointmentCard from "@/component/AppointmentCard";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import ConfirmationModal from "@/component/ModalComponent/ConfirmationModal";
import NotificationIconWithBadge from "@/component/NotificationIconWithBadge";
import StatCard from "@/component/StatCard";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppointmentFilter = "all" | "pending" | "accepted" | "completed";

const AppointmentScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<AppointmentFilter>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "success" as any
  });
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToUserAppointments(
      user.uid,
      (fetchedAppointments) => {
        setAppointments(fetchedAppointments);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filterOptions: Array<{ label: string; value: AppointmentFilter; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", value: "all", icon: "grid" },
    { label: "Pending", value: "pending", icon: "time" },
    { label: "Accepted", value: "accepted", icon: "checkmark-circle" },
    { label: "Completed", value: "completed", icon: "checkmark-done-circle" },
  ];

  const filteredAppointments = appointments
    .filter((appointment) => {
      const providerName = (appointment.nurseName ?? (appointment as any).deliveryName ?? "").toLowerCase();
      const serviceType = (appointment.serviceType ?? "").toLowerCase();

      const matchesSearch =
        providerName.includes(searchQuery.toLowerCase()) ||
        serviceType.includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "all" || appointment.status === selectedFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort by date, most recent first
      const dateA = new Date(a.appointmentDate + " " + a.appointmentTime);
      const dateB = new Date(b.appointmentDate + " " + b.appointmentTime);
      return dateB.getTime() - dateA.getTime();
    });

  const handleCancelAppointment = async (appointment: Appointment) => {
    const providerName = appointment.nurseName ?? (appointment as any).deliveryName ?? "Provider";
    setConfirmModal({
      visible: true,
      title: "Cancel Appointment",
      message: `Are you sure you want to cancel this appointment with ${providerName}?`,
      type: "danger",
      onConfirm: async () => {
        try {
          await AppointmentService.cancelAppointment(appointment.id, appointment);
          setConfirmModal(prev => ({ ...prev, visible: false }));
          toast.success("Appointment cancelled");
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          setConfirmModal(prev => ({ ...prev, visible: false }));
          toast.error("Failed to cancel appointment");
        }
      }
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
  };

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
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>My Appointments</Text>
            <NotificationIconWithBadge />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search Bar */}
      <FormInput
        LeftIcon={SearchIcon}
        placeholder="Search appointments..."
        containerStyle={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="hourglass"
          value={stats.pending}
          label="Pending"
          color={colors.warning}
        />
        <StatCard
          icon="checkmark-circle"
          value={stats.accepted}
          label="Accepted"
          color={colors.success}
        />
        <StatCard
          icon="checkmark-done"
          value={stats.completed}
          label="Completed"
          color={colors.primary}
        />
      </View>

      {/* Filter Chips */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              icon={filter.icon}
              isActive={selectedFilter === filter.value}
              onPress={() => setSelectedFilter(filter.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredAppointments.length}{" "}
          {filteredAppointments.length === 1 ? "Appointment" : "Appointments"}
        </Text>
      </View>

      {/* Appointments List */}
      <ScrollView
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
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userType="user"
              onCancel={() => handleCancelAppointment(appointment)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              {appointments.length === 0
                ? "You haven't booked any appointments yet"
                : "No appointments match your search"}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(protected)/nursing-services")}
            >
              <Text style={styles.browseButtonText}>Browse Nurses</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        type={confirmModal.type}
        confirmText="Yes, Cancel"
        cancelText="No"
      />
    </SafeAreaView>
  );
};

export default AppointmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: sizes.paddingHorizontal,
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
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: sizes.paddingHorizontal,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 6,
    marginHorizontal: -sizes.paddingHorizontal,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  resultsHeader: {
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
