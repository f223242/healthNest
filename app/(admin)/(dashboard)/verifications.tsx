import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import PaymentService, { BNPLApplication } from "@/services/PaymentService";
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

// Tab type
type TabType = "identity" | "bnpl" | "lab";

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
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  
  // Identity verification states
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

  // BNPL states
  const [bnplApplications, setBnplApplications] = useState<BNPLApplication[]>([]);
  const [bnplLoading, setBnplLoading] = useState(true);
  const [selectedBnpl, setSelectedBnpl] = useState<BNPLApplication | null>(null);
  const [showBnplModal, setShowBnplModal] = useState(false);
  const [bnplActionType, setBnplActionType] = useState<"approve" | "reject">("approve");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [bnplRejectionReason, setBnplRejectionReason] = useState("");

  // Lab onboarding states
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [labLoading, setLabLoading] = useState(true);
  const [selectedLabUser, setSelectedLabUser] = useState<any | null>(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const [labRejectionReason, setLabRejectionReason] = useState("");

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

  // Listen to BNPL applications
  useEffect(() => {
    const unsubscribe = PaymentService.listenToAllBNPLApplications((apps) => {
      setBnplApplications(apps);
      setBnplLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Lab Onboarding requests
  useEffect(() => {
    const unsubscribe = VerificationService.listenToLabDeliveryOnboarding((users) => {
      setLabRequests(users);
      setLabLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // BNPL handlers
  const handleBnplAction = (app: BNPLApplication, action: "approve" | "reject") => {
    setSelectedBnpl(app);
    setBnplActionType(action);
    setApprovedAmount(app.requestedAmount.toString());
    setBnplRejectionReason("");
    setShowBnplModal(true);
  };

  const processBnplAction = async () => {
    if (!selectedBnpl) return;
    setActionLoading(true);
    try {
      if (bnplActionType === "approve") {
        const amount = parseFloat(approvedAmount);
        if (isNaN(amount) || amount <= 0) {
          toast.error("Please enter a valid amount");
          setActionLoading(false);
          return;
        }
        await PaymentService.approveBNPL(selectedBnpl.id, amount, user?.uid || "admin");
        toast.success("BNPL application approved");
      } else {
        if (!bnplRejectionReason.trim()) {
          toast.error("Please provide a rejection reason");
          setActionLoading(false);
          return;
        }
        await PaymentService.rejectBNPL(selectedBnpl.id, bnplRejectionReason, user?.uid || "admin");
        toast.success("BNPL application rejected");
      }
      setShowBnplModal(false);
    } catch (error) {
      toast.error(`Failed to ${bnplActionType} BNPL application`);
    }
    setActionLoading(false);
  };

  // BNPL stats
  const bnplStats = {
    total: bnplApplications.length,
    pending: bnplApplications.filter((a) => a.status === "pending").length,
    approved: bnplApplications.filter((a) => ["approved", "active", "completed"].includes(a.status)).length,
    rejected: bnplApplications.filter((a) => a.status === "rejected").length,
  };

  // Lab onboarding stats
  const labStats = {
    total: labRequests.length,
    pending: labRequests.filter((u) => !u.isApproved && u.status !== "rejected").length,
    approved: labRequests.filter((u) => u.isApproved).length,
    rejected: labRequests.filter((u) => u.status === "rejected").length,
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    return (
      (req.userName && req.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.userEmail && req.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.userPhone && req.userPhone.includes(searchQuery))
    );
  });

  // Handle Approve Identity
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

  // Handle Reject Identity
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

  // Lab onboarding handlers
  const handleApproveLab = async () => {
    if (!selectedLabUser) return;
    setActionLoading(true);
    try {
      await VerificationService.approveLabDelivery(selectedLabUser.uid, user?.uid || "admin");
      toast.success("Lab Delivery Boy approved");
      setShowLabModal(false);
    } catch (error) {
      toast.error("Failed to approve");
    }
    setActionLoading(false);
  };

  const handleRejectLab = async () => {
    if (!selectedLabUser || !labRejectionReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setActionLoading(true);
    try {
      await VerificationService.rejectLabDelivery(selectedLabUser.uid, user?.uid || "admin", labRejectionReason);
      toast.success("Lab Delivery Boy rejected");
      setShowLabModal(false);
    } catch (error) {
      toast.error("Failed to reject");
    }
    setActionLoading(false);
  };

  // View document image
  const viewImage = (url: string) => {
    if (!url) return;
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

  // Get BNPL status color
  const getBnplStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
      case "active":
      case "completed":
        return "#4CAF50";
      case "rejected":
      case "defaulted":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return colors.gray;
    }
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending" || r.status === "under_review").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading && bnplLoading && labLoading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading verifications...</Text>
      </View>
    );
  }

  // Current stats based on active tab
  const currentStats = activeTab === "identity" ? stats : activeTab === "bnpl" ? bnplStats : labStats;

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
          <Text style={styles.headerTitle}>Verifications & BNPL</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === "identity" ? "Review identity verification requests" : activeTab === "bnpl" ? "Manage BNPL applications" : "Approve Lab Delivery Boys"}
          </Text>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "identity" && styles.tabButtonActive]}
              onPress={() => setActiveTab("identity")}
            >
              <Ionicons name="shield-checkmark" size={18} color={activeTab === "identity" ? "#1E293B" : colors.white} />
              <Text style={[styles.tabButtonText, activeTab === "identity" && styles.tabButtonTextActive]}>
                Identity ({stats.pending})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "bnpl" && styles.tabButtonActive]}
              onPress={() => setActiveTab("bnpl")}
            >
              <Ionicons name="card" size={18} color={activeTab === "bnpl" ? "#1E293B" : colors.white} />
              <Text style={[styles.tabButtonText, activeTab === "bnpl" && styles.tabButtonTextActive]}>
                BNPL ({bnplStats.pending})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "lab" && styles.tabButtonActive]}
              onPress={() => setActiveTab("lab")}
            >
              <Ionicons name="flask" size={18} color={activeTab === "lab" ? "#1E293B" : colors.white} />
              <Text style={[styles.tabButtonText, activeTab === "lab" && styles.tabButtonTextActive]}>
                Lab Delivery ({labStats.pending})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{currentStats.total}</Text>
              <Text style={styles.headerStatLabel}>Total</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#FCD34D" }]}>{currentStats.pending}</Text>
              <Text style={styles.headerStatLabel}>Pending</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#4ADE80" }]}>{currentStats.approved}</Text>
              <Text style={styles.headerStatLabel}>Approved</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={[styles.headerStatValue, { color: "#F87171" }]}>{currentStats.rejected}</Text>
              <Text style={styles.headerStatLabel}>Rejected</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        {activeTab === "identity" ? (
          <>
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
          </>
        ) : activeTab === "bnpl" ? (
          /* BNPL Applications Tab */
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {bnplLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : bnplApplications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color={colors.gray} />
                <Text style={styles.emptyText}>No BNPL applications found</Text>
              </View>
            ) : (
              bnplApplications.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.requestCard}
                  onPress={() => handleBnplAction(app, "approve")}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={20} color={colors.white} />
                      </View>
                      <View>
                        <Text style={styles.userName}>{app.userName}</Text>
                        <Text style={styles.userEmail}>{app.userEmail}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getBnplStatusColor(app.status) + "20" }]}>
                      <View style={[styles.statusDot, { backgroundColor: getBnplStatusColor(app.status) }]} />
                      <Text style={[styles.statusText, { color: getBnplStatusColor(app.status) }]}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Requested: PKR {app.requestedAmount.toLocaleString()}
                      </Text>
                    </View>
                    {app.approvedAmount && (
                      <View style={styles.detailRow}>
                        <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                        <Text style={styles.detailText}>
                          Approved: PKR {app.approvedAmount.toLocaleString()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        {app.installments} months @ {app.interestRate}% interest
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Applied: {app.createdAt.toDate().toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {app.status === "pending" && (
                    <View style={styles.bnplActions}>
                      <TouchableOpacity
                        style={[styles.bnplActionBtn, styles.approveBtn]}
                        onPress={() => handleBnplAction(app, "approve")}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                        <Text style={styles.bnplActionText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.bnplActionBtn, styles.rejectBtn]}
                        onPress={() => handleBnplAction(app, "reject")}
                      >
                        <Ionicons name="close" size={16} color={colors.white} />
                        <Text style={styles.bnplActionText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          /* Lab Delivery Tab */
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {labLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : labRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="flask-outline" size={48} color={colors.gray} />
                <Text style={styles.emptyText}>No Lab Delivery requests found</Text>
              </View>
            ) : (
              labRequests.map((req) => (
                <TouchableOpacity
                  key={req.uid}
                  style={styles.requestCard}
                  onPress={() => {
                    setSelectedLabUser(req);
                    setShowLabModal(true);
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={20} color={colors.white} />
                      </View>
                      <View>
                        <Text style={styles.userName}>{`${req.firstname || ""} ${req.lastname || ""}`}</Text>
                        <Text style={styles.userEmail}>{req.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: req.isApproved ? '#4CAF5020' : req.status === 'rejected' ? '#F4433620' : '#FF980020' }]}>
                      <View style={[styles.statusDot, { backgroundColor: req.isApproved ? '#4CAF50' : req.status === 'rejected' ? '#F44336' : '#FF9800' }]} />
                      <Text style={[styles.statusText, { color: req.isApproved ? '#4CAF50' : req.status === 'rejected' ? '#F44336' : '#FF9800' }]}>
                        {req.isApproved ? 'Approved' : req.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="school-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Matric Type: {req.matricType}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Certificate: {req.certificateName}
                      </Text>
                    </View>
                    {req.certificateUrl && (
                      <TouchableOpacity 
                        style={[styles.detailRow, { marginTop: 4, paddingVertical: 4 }]} 
                        onPress={() => viewImage(req.certificateUrl)}
                      >
                        <Ionicons name="eye-outline" size={14} color={colors.primary} />
                        <Text style={[styles.detailText, { color: colors.primary, textDecorationLine: 'underline', fontWeight: 'bold' }]}>
                          View Certificate Document
                        </Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={14} color={colors.gray} />
                      <Text style={styles.detailText}>
                        Submitted: {req.updatedAt ? new Date(req.updatedAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {!req.isApproved && req.status !== 'rejected' && (
                    <View style={styles.bnplActions}>
                      <TouchableOpacity
                        style={[styles.bnplActionBtn, styles.approveBtn]}
                        onPress={() => {
                          setSelectedLabUser(req);
                          handleApproveLab();
                        }}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                        <Text style={styles.bnplActionText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.bnplActionBtn, styles.rejectBtn]}
                        onPress={() => {
                          setSelectedLabUser(req);
                          setShowLabModal(true);
                        }}
                      >
                        <Ionicons name="close" size={16} color={colors.white} />
                        <Text style={styles.bnplActionText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* BNPL Action Modal */}
      <Modal visible={showBnplModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {bnplActionType === "approve" ? "Approve BNPL" : "Reject BNPL"}
              </Text>
              <TouchableOpacity onPress={() => setShowBnplModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            {selectedBnpl && (
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Application Details</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Applicant:</Text>
                  <Text style={styles.infoValue}>{selectedBnpl.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Requested Amount:</Text>
                  <Text style={styles.infoValue}>PKR {selectedBnpl.requestedAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Installments:</Text>
                  <Text style={styles.infoValue}>{selectedBnpl.installments} months</Text>
                </View>

                {bnplActionType === "approve" ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.infoLabel}>Approved Amount:</Text>
                    <TextInput
                      style={styles.bnplInput}
                      value={approvedAmount}
                      onChangeText={setApprovedAmount}
                      keyboardType="numeric"
                      placeholder="Enter approved amount"
                    />
                  </View>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.infoLabel}>Rejection Reason:</Text>
                    <TextInput
                      style={[styles.bnplInput, { height: 100, textAlignVertical: "top" }]}
                      value={bnplRejectionReason}
                      onChangeText={setBnplRejectionReason}
                      multiline
                      placeholder="Enter reason for rejection"
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.bnplSubmitBtn,
                    { backgroundColor: bnplActionType === "approve" ? colors.success : colors.danger },
                  ]}
                  onPress={processBnplAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.bnplSubmitText}>
                      {bnplActionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
                  {(selectedRequest.faceMatchScore !== undefined || selectedRequest.documentAuthenticityScore !== undefined) && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Verification Scores</Text>
                      {selectedRequest.faceMatchScore !== undefined && (
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
                      {selectedRequest.documentAuthenticityScore !== undefined && (
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
                      {Object.entries(selectedRequest.extractedData || {}).map(([key, value]) => (
                        <View key={key} style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
                          </Text>
                          <Text style={styles.infoValue}>{String(value)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Documents */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.documentsGrid}>
                      {(selectedRequest.documents || []).map((doc, index) => (
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

      {/* Lab Action Modal */}
      <Modal visible={showLabModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lab Delivery Onboarding</Text>
              <TouchableOpacity onPress={() => setShowLabModal(false)}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            {selectedLabUser && (
              <ScrollView style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Verification Details</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{`${selectedLabUser.firstname || ""} ${selectedLabUser.lastname || ""}`}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Matric Type:</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: 'bold' }]}>{selectedLabUser.matricType}</Text>
                </View>
                
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Certificate</Text>
                <TouchableOpacity onPress={() => viewImage(selectedLabUser.certificateUrl)}>
                  <Image source={{ uri: selectedLabUser.certificateUrl }} style={styles.modalCertificate} resizeMode="cover" />
                  <View style={styles.viewDocOverlay}>
                    <Ionicons name="expand" size={24} color={colors.white} />
                  </View>
                </TouchableOpacity>

                <View style={{ marginTop: 20 }}>
                  <Text style={styles.infoLabel}>Rejection Reason (if rejecting):</Text>
                  <TextInput
                    style={[styles.bnplInput, { height: 80, textAlignVertical: "top" }]}
                    value={labRejectionReason}
                    onChangeText={setLabRejectionReason}
                    multiline
                    placeholder="Enter reason for rejection"
                  />
                </View>

                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.rejectBtn]}
                    onPress={handleRejectLab}
                    disabled={actionLoading}
                  >
                    <Text style={styles.modalActionText}>Reject Application</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.approveBtn]}
                    onPress={handleApproveLab}
                    disabled={actionLoading}
                  >
                    <Text style={styles.modalActionText}>Approve & Activate</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
  listContent: {
    paddingVertical: 12,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDetails: {
    marginTop: 12,
    gap: 8,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  modalCertificate: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  viewDocOverlay: {
    position: 'absolute',
    top: 10,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionText: {
    color: colors.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
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
  // Tab switcher styles
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.white,
  },
  tabButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  tabButtonTextActive: {
    color: "#1E293B",
  },
  // BNPL specific styles
  bnplActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  bnplActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bnplActionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  bnplInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    padding: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginTop: 8,
  },
  bnplSubmitBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  bnplSubmitText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
