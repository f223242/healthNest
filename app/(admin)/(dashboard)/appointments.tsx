import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
  amount: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
}

const AppointmentsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Scheduled" | "Completed" | "Cancelled" | "No Show">("All");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sample data
  const appointments: Appointment[] = [
    {
      id: 1,
      patientName: "John Doe",
      patientEmail: "john.doe@example.com",
      service: "Blood Test",
      provider: "City Lab",
      date: "Nov 30, 2025",
      time: "10:00 AM",
      status: "Scheduled",
      amount: "$50",
      paymentStatus: "Paid",
    },
    {
      id: 2,
      patientName: "Sarah Johnson",
      patientEmail: "sarah.j@example.com",
      service: "Home Nursing",
      provider: "Nurse Emily",
      date: "Nov 29, 2025",
      time: "2:00 PM",
      status: "Completed",
      amount: "$120",
      paymentStatus: "Paid",
    },
    {
      id: 3,
      patientName: "Michael Chen",
      patientEmail: "michael.c@example.com",
      service: "X-Ray",
      provider: "Metro Diagnostics",
      date: "Nov 28, 2025",
      time: "11:30 AM",
      status: "Completed",
      amount: "$80",
      paymentStatus: "Paid",
    },
    {
      id: 4,
      patientName: "Emma Wilson",
      patientEmail: "emma.w@example.com",
      service: "Physiotherapy",
      provider: "Nurse Sarah",
      date: "Nov 27, 2025",
      time: "3:00 PM",
      status: "Cancelled",
      amount: "$100",
      paymentStatus: "Refunded",
    },
    {
      id: 5,
      patientName: "David Brown",
      patientEmail: "david.b@example.com",
      service: "ECG Test",
      provider: "Heart Care Lab",
      date: "Nov 26, 2025",
      time: "9:00 AM",
      status: "No Show",
      amount: "$60",
      paymentStatus: "Pending",
    },
    {
      id: 6,
      patientName: "Lisa Anderson",
      patientEmail: "lisa.a@example.com",
      service: "Diabetes Test",
      provider: "City Lab",
      date: "Dec 1, 2025",
      time: "1:00 PM",
      status: "Scheduled",
      amount: "$75",
      paymentStatus: "Paid",
    },
    {
      id: 7,
      patientName: "Robert Taylor",
      patientEmail: "robert.t@example.com",
      service: "Wound Care",
      provider: "Nurse John",
      date: "Dec 2, 2025",
      time: "4:30 PM",
      status: "Scheduled",
      amount: "$90",
      paymentStatus: "Pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#2196F3";
      case "Completed":
        return colors.success;
      case "Cancelled":
        return colors.danger;
      case "No Show":
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return colors.success;
      case "Pending":
        return colors.warning;
      case "Refunded":
        return "#9E9E9E";
      default:
        return colors.gray;
    }
  };

  const columns: TableColumn[] = [
    {
      key: "id",
      title: "ID",
      width: 60,
    },
    {
      key: "patientName",
      title: "Patient",
      width: 150,
    },
    {
      key: "service",
      title: "Service",
      width: 150,
    },
    {
      key: "provider",
      title: "Provider",
      width: 150,
    },
    {
      key: "date",
      title: "Date",
      width: 120,
    },
    {
      key: "time",
      title: "Time",
      width: 100,
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (value) => (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(value) + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: "paymentStatus",
      title: "Payment",
      width: 100,
      render: (value) => (
        <View
          style={[
            styles.paymentBadge,
            { backgroundColor: getPaymentColor(value) + "20" },
          ]}
        >
          <Text style={[styles.paymentText, { color: getPaymentColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      width: 100,
    },
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total", value: appointments.length, color: colors.primary },
    {
      label: "Scheduled",
      value: appointments.filter((a) => a.status === "Scheduled").length,
      color: "#2196F3",
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "Completed").length,
      color: colors.success,
    },
    {
      label: "Cancelled",
      value: appointments.filter((a) => a.status === "Cancelled").length,
      color: colors.danger,
    },
  ];

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                { borderLeftColor: stat.color, borderLeftWidth: 4 },
              ]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <FormInput
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            LeftIcon={() => <Ionicons name="search" size={20} color={colors.gray} />}
            containerStyle={styles.searchInput}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {(["All", "Scheduled", "Completed", "Cancelled", "No Show"] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterStatus === status && styles.filterTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointments Table */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>All Appointments</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => Alert.alert("Info", "Add appointment feature")}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <AdminTable
            columns={columns}
            data={filteredAppointments}
            onRowPress={handleAppointmentPress}
            emptyMessage="No appointments found"
          />
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>#{selectedAppointment.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Patient:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.patientName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.patientEmail}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.service}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Provider:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.provider}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedAppointment.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedAppointment.status) },
                      ]}
                    >
                      {selectedAppointment.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment:</Text>
                  <View
                    style={[
                      styles.paymentBadge,
                      { backgroundColor: getPaymentColor(selectedAppointment.paymentStatus) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentText,
                        { color: getPaymentColor(selectedAppointment.paymentStatus) },
                      ]}
                    >
                      {selectedAppointment.paymentStatus}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={[styles.detailValue, styles.amountText]}>
                    {selectedAppointment.amount}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => {
                      Alert.alert("Success", "Appointment completed");
                      setShowDetailModal(false);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={colors.white} />
                    <Text style={styles.actionButtonText}>Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => {
                      Alert.alert("Success", "Appointment cancelled");
                      setShowDetailModal(false);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.white} />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rescheduleButton]}
                  onPress={() => {
                    Alert.alert("Info", "Reschedule feature");
                  }}
                >
                  <Ionicons name="calendar" size={18} color={colors.white} />
                  <Text style={styles.actionButtonText}>Reschedule</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AppointmentsManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 12,
  },
  filtersContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  filterTextActive: {
    color: colors.white,
  },
  tableSection: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  paymentText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  amountText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  rescheduleButton: {
    backgroundColor: "#2196F3",
    marginBottom: 20,
  },
});
