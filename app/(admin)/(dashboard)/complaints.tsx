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
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Complaint {
  id: number;
  subject: string;
  category: string;
  user: string;
  email: string;
  message: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  date: string;
  priority: "Low" | "Medium" | "High";
}

const ComplaintsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "In Progress" | "Resolved" | "Rejected">("All");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sample data
  const complaints: Complaint[] = [
    {
      id: 1,
      subject: "Lab Test Results Delay",
      category: "Service Quality",
      user: "John Doe",
      email: "john.doe@example.com",
      message: "My lab test results were supposed to be ready in 24 hours, but it's been 3 days and I still haven't received them.",
      status: "Pending",
      date: "Nov 26, 2025",
      priority: "High",
    },
    {
      id: 2,
      subject: "Incorrect Billing Amount",
      category: "Billing Problem",
      user: "Sarah Johnson",
      email: "sarah.j@example.com",
      message: "I was charged $150 for a service that costs $100. Please review my bill.",
      status: "In Progress",
      date: "Nov 25, 2025",
      priority: "Medium",
    },
    {
      id: 3,
      subject: "Nurse Unprofessional Behavior",
      category: "Provider Behavior",
      user: "Michael Chen",
      email: "michael.c@example.com",
      message: "The nurse assigned to my mother was rude and unprofessional during the home visit.",
      status: "Resolved",
      date: "Nov 24, 2025",
      priority: "High",
    },
    {
      id: 4,
      subject: "App Crashing Issue",
      category: "Technical Issue",
      user: "Emma Wilson",
      email: "emma.w@example.com",
      message: "The app keeps crashing when I try to book an appointment.",
      status: "In Progress",
      date: "Nov 23, 2025",
      priority: "Low",
    },
    {
      id: 5,
      subject: "Medicine Not Delivered",
      category: "Service Quality",
      user: "David Brown",
      email: "david.b@example.com",
      message: "Ordered medicines 5 days ago, still not delivered despite payment.",
      status: "Pending",
      date: "Nov 22, 2025",
      priority: "High",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return colors.warning;
      case "In Progress":
        return "#2196F3";
      case "Resolved":
        return colors.success;
      case "Rejected":
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return colors.danger;
      case "Medium":
        return colors.warning;
      case "Low":
        return "#4CAF50";
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
      key: "subject",
      title: "Subject",
      width: 200,
    },
    {
      key: "category",
      title: "Category",
      width: 150,
    },
    {
      key: "user",
      title: "User",
      width: 150,
    },
    {
      key: "priority",
      title: "Priority",
      width: 100,
      render: (value) => (
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(value) + "20" },
          ]}
        >
          <Text style={[styles.priorityText, { color: getPriorityColor(value) }]}>
            {value}
          </Text>
        </View>
      ),
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
      key: "date",
      title: "Date",
      width: 120,
    },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total", value: complaints.length, color: colors.primary },
    {
      label: "Pending",
      value: complaints.filter((c) => c.status === "Pending").length,
      color: colors.warning,
    },
    {
      label: "In Progress",
      value: complaints.filter((c) => c.status === "In Progress").length,
      color: "#2196F3",
    },
    {
      label: "Resolved",
      value: complaints.filter((c) => c.status === "Resolved").length,
      color: colors.success,
    },
  ];

  const handleComplaintPress = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
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
            placeholder="Search complaints..."
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
            {(["All", "Pending", "In Progress", "Resolved", "Rejected"] as const).map((status) => (
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

        {/* Complaints Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>All Complaints</Text>
          <AdminTable
            columns={columns}
            data={filteredComplaints}
            onRowPress={handleComplaintPress}
            emptyMessage="No complaints found"
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
              <Text style={styles.modalTitle}>Complaint Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            {selectedComplaint && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>#{selectedComplaint.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subject:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.subject}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.user}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority:</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(selectedComplaint.priority) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(selectedComplaint.priority) },
                      ]}
                    >
                      {selectedComplaint.priority}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedComplaint.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedComplaint.status) },
                      ]}
                    >
                      {selectedComplaint.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.date}</Text>
                </View>

                <View style={styles.messageSection}>
                  <Text style={styles.detailLabel}>Message:</Text>
                  <Text style={styles.messageText}>{selectedComplaint.message}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => {
                      Alert.alert("Success", "Complaint resolved");
                      setShowDetailModal(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Resolve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => {
                      Alert.alert("Success", "Complaint rejected");
                      setShowDetailModal(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ComplaintsManagement;

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
  tableTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
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
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  priorityText: {
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
  messageSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 22,
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
