import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StatusBar,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const toast = useToast();

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
      width: 180,
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
    { label: "Total", value: complaints.length, color: '#1E293B' },
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#1E293B', '#334155', '#475569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Complaints</Text>
          <Text style={styles.headerSubtitle}>Manage user complaints & issues</Text>

          {/* Stats in Header */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{complaints.length}</Text>
              <Text style={styles.headerStatLabel}>Total</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: '#FCD34D' }]}>{complaints.filter(c => c.status === "Pending").length}</Text>
              <Text style={styles.headerStatLabel}>Pending</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: '#60A5FA' }]}>{complaints.filter(c => c.status === "In Progress").length}</Text>
              <Text style={styles.headerStatLabel}>In Progress</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: '#4ADE80' }]}>{complaints.filter(c => c.status === "Resolved").length}</Text>
              <Text style={styles.headerStatLabel}>Resolved</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

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

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

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
                      toast.success("Complaint resolved");
                      setShowDetailModal(false);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Resolve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger }]}
                    onPress={() => {
                      toast.success("Complaint rejected");
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
    </View>
  );
};

export default ComplaintsManagement;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: sizes.paddingHorizontal,
  },

  headerContent: {
    width: '100%',
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },

  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  headerStatValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 2,
  },

  headerStatLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },

  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 100,
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
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
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
