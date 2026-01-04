import { colors, Fonts, sizes } from "@/constant/theme";
import PaymentService, { BNPLApplication } from "@/services/PaymentService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminBNPLScreen = () => {
  const [applications, setApplications] = useState<BNPLApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApplication, setSelectedApplication] = useState<BNPLApplication | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // In real app, this would use a listener. For now, fetch all.
      const unsubscribe = PaymentService.listenToAllBNPLApplications((apps) => {
        setApplications(apps);
        setIsLoading(false);
        setIsRefreshing(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading applications:", error);
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadApplications();
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "#4CAF50";
      case "rejected":
      case "defaulted":
        return "#F44336";
      case "pending":
        return "#FF9800";
      case "completed":
        return "#2196F3";
      default:
        return colors.gray;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => ["approved", "active", "completed"].includes(a.status)).length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    totalValue: applications
      .filter((a) => ["approved", "active", "completed"].includes(a.status))
      .reduce((sum, a) => sum + (a.approvedAmount || 0), 0),
  };

  const handleAction = (application: BNPLApplication, action: "approve" | "reject") => {
    setSelectedApplication(application);
    setActionType(action);
    setApprovedAmount(application.requestedAmount.toString());
    setRejectionReason("");
    setShowActionModal(true);
  };

  const processAction = async () => {
    if (!selectedApplication) return;

    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        await PaymentService.adminApproveBNPL(
          selectedApplication.id,
          "admin",
          parseFloat(approvedAmount) || selectedApplication.requestedAmount
        );
      } else {
        await PaymentService.adminRejectBNPL(
          selectedApplication.id,
          "admin",
          rejectionReason || "Application rejected"
        );
      }
      setShowActionModal(false);
    } catch (error) {
      console.error("Error processing action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.headerTitle}>BNPL Management</Text>
        <Text style={styles.headerSubtitle}>Manage Buy Now Pay Later applications</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="documents" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
            <Text style={styles.statValue}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F3E5F5" }]}>
            <Ionicons name="cash" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>PKR {(stats.totalValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Approved Value</Text>
          </View>
        </ScrollView>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {["all", "pending", "approved", "rejected"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                filter === f && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Applications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Applications ({filteredApplications.length})
          </Text>

          {filteredApplications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyText}>No applications found</Text>
            </View>
          ) : (
            filteredApplications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.applicantName}>{application.userName}</Text>
                    <Text style={styles.applicantEmail}>{application.userEmail}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                    <Text style={styles.statusText}>{application.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested Amount</Text>
                    <Text style={styles.detailValue}>PKR {application.requestedAmount.toLocaleString()}</Text>
                  </View>
                  {application.approvedAmount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Approved Amount</Text>
                      <Text style={[styles.detailValue, { color: colors.primary }]}>
                        PKR {application.approvedAmount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Installments</Text>
                    <Text style={styles.detailValue}>{application.installments} months</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Interest Rate</Text>
                    <Text style={styles.detailValue}>{application.interestRate}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{application.userPhone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied On</Text>
                    <Text style={styles.detailValue}>{formatDate(application.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.verificationStatus}>
                  <View style={styles.verifyItem}>
                    <Ionicons
                      name={application.identityVerified ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={application.identityVerified ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={styles.verifyText}>Identity</Text>
                  </View>
                  <View style={styles.verifyItem}>
                    <Ionicons
                      name={application.incomeVerified ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={application.incomeVerified ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={styles.verifyText}>Income</Text>
                  </View>
                  {application.creditScore && (
                    <View style={styles.verifyItem}>
                      <Ionicons name="stats-chart" size={18} color={colors.primary} />
                      <Text style={styles.verifyText}>Score: {application.creditScore}</Text>
                    </View>
                  )}
                </View>

                {application.status === "pending" && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleAction(application, "approve")}
                    >
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleAction(application, "reject")}
                    >
                      <Ionicons name="close" size={18} color={colors.white} />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {application.rejectionReason && (
                  <View style={styles.rejectionBox}>
                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectionText}>{application.rejectionReason}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </Text>

            {actionType === "approve" ? (
              <>
                <Text style={styles.modalLabel}>Approved Amount (PKR)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={approvedAmount}
                  onChangeText={setApprovedAmount}
                  keyboardType="numeric"
                  placeholder="Enter approved amount"
                />
                <Text style={styles.modalHint}>
                  Requested: PKR {selectedApplication?.requestedAmount.toLocaleString()}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.modalLabel}>Rejection Reason</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="Enter reason for rejection"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowActionModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  actionType === "reject" && styles.confirmButtonDanger,
                ]}
                onPress={processAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {actionType === "approve" ? "Approve" : "Reject"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminBNPLScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    width: 110,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  filterTextActive: {
    color: colors.white,
  },
  section: {
    paddingHorizontal: sizes.paddingHorizontal,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 12,
  },
  applicationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  applicantName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  applicantEmail: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  verificationStatus: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  verifyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifyText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  rejectionBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  rejectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#F44336",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalHint: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  confirmButtonDanger: {
    backgroundColor: "#F44336",
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
