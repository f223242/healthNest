import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import VerificationService, { VerificationRequest, VerificationStatus } from "@/services/VerificationService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Status display mapping
const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "#FFA500", icon: "time" },
  under_review: { label: "Under Review", color: "#2196F3", icon: "eye" },
  approved: { label: "Approved", color: "#4CAF50", icon: "checkmark-circle" },
  rejected: { label: "Rejected", color: "#F44336", icon: "close-circle" },
  expired: { label: "Expired", color: "#9E9E9E", icon: "alert-circle" },
};

const VerificationsManagement = () => {
  const { user } = useAuthContext();
  const toast = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | VerificationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Listen to verification requests
  useEffect(() => {
    const statusFilter = filterStatus === "all" ? undefined : filterStatus;
    const unsubscribe = VerificationService.listenToVerificationRequests(
      (data) => {
        setRequests(data);
        setLoading(false);
      },
      statusFilter
    );

    return () => unsubscribe();
  }, [filterStatus]);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    return (
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userPhone?.includes(searchQuery)
    );
  });

  // Handle approve
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await VerificationService.approveVerification(
        selectedRequest.id,
        user?.uid || "admin",
        "Approved by admin"
      );
      toast.success("Verification approved successfully");
      setShowDetailModal(false);
    } catch (error) {
      toast.error("Failed to approve verification");
    }
    setActionLoading(false);
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await VerificationService.rejectVerification(
        selectedRequest.id,
        user?.uid || "admin",
        rejectionReason
      );
      toast.success("Verification rejected");
      setShowDetailModal(false);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject verification");
    }
    setActionLoading(false);
  };

  // View document image
  const viewImage = (url: string) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  // Get document label
  const getDocumentLabel = (type: string): string => {
    switch (type) {
      case "cnic_front":
        return "CNIC Front";
      case "cnic_back":
        return "CNIC Back";
      case "selfie":
        return "Selfie";
      case "passport":
        return "Passport";
      case "driving_license":
        return "Driving License";
      default:
        return type;
    }
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending" || r.status === "under_review").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading verifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <LinearGradient
        colors={["#1E293B", "#334155", "#475569"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Verifications</Text>
          <Text style={styles.headerSubtitle}>Review identity verification requests</Text>

          {/* Stats */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{stats.total}</Text>
              <Text style={styles.headerStatLabel}>Total</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#FCD34D" }]}>{stats.pending}</Text>
              <Text style={styles.headerStatLabel}>Pending</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#4ADE80" }]}>{stats.approved}</Text>
              <Text style={styles.headerStatLabel}>Approved</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#F87171" }]}>{stats.rejected}</Text>
              <Text style={styles.headerStatLabel}>Rejected</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        {/* Search & Filter */}
        <View style={styles.filterSection}>
          <FormInput
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {["all", "pending", "under_review", "approved", "rejected"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && styles.filterTabActive,
                ]}
                onPress={() => setFilterStatus(status as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterStatus === status && styles.filterTabTextActive,
                  ]}
                >
                  {status === "all" ? "All" : statusConfig[status as VerificationStatus]?.label || status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Requests List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={60} color={colors.gray} />
              <Text style={styles.emptyText}>No verification requests found</Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => {
                  setSelectedRequest(request);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={20} color={colors.white} />
                    </View>
                    <View>
                      <Text style={styles.userName}>{request.userName}</Text>
                      <Text style={styles.userEmail}>{request.userEmail}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig[request.status].color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig[request.status].icon as any}
                      size={14}
                      color={statusConfig[request.status].color}
                    />
                    <Text style={[styles.statusText, { color: statusConfig[request.status].color }]}>
                      {statusConfig[request.status].label}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={14} color={colors.gray} />
                    <Text style={styles.detailText}>{request.userPhone || "N/A"}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                    <Text style={styles.detailText}>
                      {request.createdAt.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                  {request.faceMatchScore && (
                    <View style={styles.detailRow}>
                      <Ionicons name="scan-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Face Match: {request.faceMatchScore}%
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.documentsPreview}>
                  {request.documents.slice(0, 3).map((doc, index) => (
                    <View key={index} style={styles.docPreview}>
                      <Image source={{ uri: doc.imageUrl }} style={styles.docThumb} />
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Verification Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>

              {selectedRequest && (
                <>
                  {/* User Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>User Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.userName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.userEmail}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{selectedRequest.userPhone || "N/A"}</Text>
                    </View>
                  </View>

                  {/* Verification Scores */}
                  {(selectedRequest.faceMatchScore || selectedRequest.documentAuthenticityScore) && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Verification Scores</Text>
                      {selectedRequest.faceMatchScore && (
                        <View style={styles.scoreRow}>
                          <Text style={styles.scoreLabel}>Face Match</Text>
                          <View style={styles.scoreBar}>
                            <View
                              style={[
                                styles.scoreProgress,
                                {
                                  width: `${selectedRequest.faceMatchScore}%`,
                                  backgroundColor:
                                    selectedRequest.faceMatchScore >= 70 ? "#4CAF50" : "#F44336",
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.scoreValue}>{selectedRequest.faceMatchScore}%</Text>
                        </View>
                      )}
                      {selectedRequest.documentAuthenticityScore && (
                        <View style={styles.scoreRow}>
                          <Text style={styles.scoreLabel}>Document Auth</Text>
                          <View style={styles.scoreBar}>
                            <View
                              style={[
                                styles.scoreProgress,
                                {
                                  width: `${selectedRequest.documentAuthenticityScore}%`,
                                  backgroundColor:
                                    selectedRequest.documentAuthenticityScore >= 70
                                      ? "#4CAF50"
                                      : "#F44336",
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.scoreValue}>
                            {selectedRequest.documentAuthenticityScore}%
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Extracted Data */}
                  {selectedRequest.extractedData && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Extracted Information</Text>
                      {Object.entries(selectedRequest.extractedData).map(([key, value]) => (
                        <View key={key} style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
                          </Text>
                          <Text style={styles.infoValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Documents */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.documentsGrid}>
                      {selectedRequest.documents.map((doc, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.documentCard}
                          onPress={() => viewImage(doc.imageUrl)}
                        >
                          <Image source={{ uri: doc.imageUrl }} style={styles.documentImage} />
                          <Text style={styles.documentLabel}>{getDocumentLabel(doc.type)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Actions */}
                  {(selectedRequest.status === "pending" ||
                    selectedRequest.status === "under_review") && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Actions</Text>

                      <TextInput
                        style={styles.rejectionInput}
                        placeholder="Rejection reason (required for rejection)"
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        multiline
                        numberOfLines={3}
                      />

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={handleReject}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="close-circle" size={18} color="#fff" />
                              <Text style={styles.actionBtnText}>Reject</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={handleApprove}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="checkmark-circle" size={18} color="#fff" />
                              <Text style={styles.actionBtnText}>Approve</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Rejection Reason if rejected */}
                  {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Rejection Reason</Text>
                      <Text style={styles.rejectionReasonText}>
                        {selectedRequest.rejectionReason}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal visible={showImageModal} animationType="fade" transparent>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

export default VerificationsManagement;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  headerContent: {},
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  headerStats: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
  },
  headerStatItem: {
    flex: 1,
    alignItems: "center",
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  headerStatValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: "#fff",
  },
  headerStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  filterSection: {
    padding: sizes.paddingHorizontal,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: "row",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.gray,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: colors.black,
  },
  userEmail: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  requestDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
  },
  documentsPreview: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  docPreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
  },
  docThumb: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: colors.black,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.gray,
    width: 100,
  },
  infoValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: colors.gray,
    width: 100,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 4,
  },
  scoreValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: colors.black,
    width: 40,
    textAlign: "right",
  },
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  documentCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  documentImage: {
    width: "100%",
    height: "80%",
  },
  documentLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: colors.black,
    textAlign: "center",
    paddingVertical: 4,
    backgroundColor: "#F8F9FA",
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectBtn: {
    backgroundColor: "#F44336",
  },
  approveBtn: {
    backgroundColor: "#4CAF50",
  },
  actionBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#fff",
  },
  rejectionReasonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#F44336",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
