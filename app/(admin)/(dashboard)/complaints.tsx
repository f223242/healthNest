import AdminTable, { TableColumn } from "@/component/admin/AdminTable";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService, { ComplaintStatus, Complaint as ComplaintType } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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

// Map backend status to display format
const statusMap: Record<ComplaintStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
  escalated: "Escalated",
};

const reverseStatusMap: Record<string, ComplaintStatus> = {
  "Pending": "pending",
  "In Progress": "in_progress",
  "Resolved": "resolved",
  "Rejected": "rejected",
  "Escalated": "escalated",
};

interface DisplayComplaint {
  id: string;
  subject: string;
  category: string;
  user: string;
  email: string;
  message: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected" | "Escalated";
  date: string;
  priority: "Low" | "Medium" | "High";
  rawData: ComplaintType;
}

const ComplaintsManagement = () => {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "In Progress" | "Resolved" | "Rejected">("All");
  const [selectedComplaint, setSelectedComplaint] = useState<DisplayComplaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [complaints, setComplaints] = useState<DisplayComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which action is loading
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

  // Listen to complaints from backend
  useEffect(() => {
    const unsubscribe = FeedbackComplaintService.listenToComplaints((rawComplaints) => {
      const formatted: DisplayComplaint[] = rawComplaints.map((c) => ({
        id: c.id,
        subject: c.subject,
        category: c.category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        user: c.userName,
        email: c.userEmail,
        message: c.description,
        status: statusMap[c.status] as DisplayComplaint["status"],
        date: c.createdAt.toDate().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        priority: c.priority.charAt(0).toUpperCase() + c.priority.slice(1) as DisplayComplaint["priority"],
        rawData: c,
      }));
      setComplaints(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toast = useToast();

  // Handle status change
  const handleStatusChange = async (complaint: DisplayComplaint, newStatus: ComplaintStatus) => {
    console.log("handleStatusChange called:", complaint.id, newStatus);
    setActionLoading(newStatus);
    try {
      await FeedbackComplaintService.updateComplaintStatus(
        complaint.id,
        user?.uid || "admin",
        user?.firstname || "Admin",
        newStatus
      );
      toast.success(`Status updated to ${statusMap[newStatus]}`);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resolve complaint
  const handleResolve = async (complaint: DisplayComplaint, resolution: string) => {
    console.log("handleResolve called:", complaint.id);
    setActionLoading("resolve");
    try {
      await FeedbackComplaintService.resolveComplaint(
        complaint.id,
        user?.uid || "admin",
        user?.firstname || "Admin",
        resolution
      );
      toast.success("Complaint resolved successfully");
      setShowDetailModal(false);
    } catch (error) {
      console.error("Resolve error:", error);
      toast.error("Failed to resolve complaint");
    } finally {
      setActionLoading(null);
    }
  };

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

  const handleComplaintPress = (complaint: DisplayComplaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, fontFamily: Fonts.medium, color: colors.gray }}>
          Loading complaints...
        </Text>
      </View>
    );
  }

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
                    style={[
                      styles.actionButton, 
                      { backgroundColor: "#2196F3" },
                      actionLoading === "in_progress" && { opacity: 0.7 }
                    ]}
                    activeOpacity={0.7}
                    disabled={actionLoading !== null}
                    onPress={() => {
                      console.log("In Progress button pressed");
                      if (selectedComplaint) {
                        handleStatusChange(selectedComplaint, "in_progress");
                      }
                    }}
                  >
                    {actionLoading === "in_progress" ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>In Progress</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      { backgroundColor: colors.success },
                      actionLoading === "resolve" && { opacity: 0.7 }
                    ]}
                    activeOpacity={0.7}
                    disabled={actionLoading !== null}
                    onPress={() => {
                      console.log("Resolve button pressed");
                      if (selectedComplaint) {
                        handleResolve(selectedComplaint, "Issue has been addressed and resolved by admin.");
                      }
                    }}
                  >
                    {actionLoading === "resolve" ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Resolve</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      { backgroundColor: colors.danger },
                      actionLoading === "rejected" && { opacity: 0.7 }
                    ]}
                    activeOpacity={0.7}
                    disabled={actionLoading !== null}
                    onPress={() => {
                      console.log("Reject button pressed");
                      if (selectedComplaint) {
                        handleStatusChange(selectedComplaint, "rejected");
                      }
                    }}
                  >
                    {actionLoading === "rejected" ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Reject</Text>
                    )}
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
    marginBottom: 40,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
