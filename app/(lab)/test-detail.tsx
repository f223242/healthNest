import AppButton from "@/component/AppButton";
import DeliveryPersonCard, {
    DeliveryPerson,
} from "@/component/DeliveryPersonCard";
import ConfirmationModal from "@/component/ModalComponent/ConfirmationModal";
import QuickActionButton from "@/component/QuickActionButton";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService from "@/services/FeedbackComplaintService";
import LabTestService, {
    LabTestRequest,
    TestRequestStatus,
} from "@/services/LabTestService";
import VerificationService from "@/services/VerificationService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TestDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user: currentUser, getAllUsers } = useAuthContext();
  const toast = useToast();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState<LabTestRequest | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

    if (id) {
      fetchTestDetail();
    }
  }, [id]);

  const fetchTestDetail = async () => {
    try {
      setLoading(true);
      const data = await LabTestService.getTestRequestById(id as string);
      setTestDetail(data);
    } catch (error) {
      console.error("Error fetching test detail:", error);
      toast.error("Failed to fetch test details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDelivery = async () => {
    console.log(
      "🚚 [fetchAvailableDelivery] Starting to fetch delivery boys...",
    );
    setLoadingDelivery(true);
    try {
      const approvedBoys =
        await VerificationService.getApprovedLabDeliveryBoys();
      console.log(
        `📦 [fetchAvailableDelivery] Received ${approvedBoys.length} approved boys:`,
        approvedBoys.map((b) => ({
          id: b.id,
          firstname: b.firstname,
          lastname: b.lastname,
          role: b.role,
          isApproved: b.isApproved,
        })),
      );
      const deliveryData: DeliveryPerson[] = await Promise.all(
        approvedBoys.map(async (u: any, index: number) => {
          const fullName =
            `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
            "Lab Delivery Person";

          let rating = 0;
          let totalDeliveries = 0;
          try {
            const ratingStats =
              await FeedbackComplaintService.getProviderRatingStats(u.id);
            rating = ratingStats.averageRating || 0;
            totalDeliveries = ratingStats.totalReviews || 0;
          } catch (err) {}

          return {
            id: index + 1,
            name: fullName,
            avatar:
              u.profileImage ||
              u.additionalInfo?.profileImage ||
              "https://via.placeholder.com/100",
            rating,
            totalDeliveries,
            isAvailable: true,
            uid: u.id,
            vehicleType: u.additionalInfo?.vehicleType || "Bike",
            deliveryTime: "20-30 min",
            distance: u.additionalInfo?.city || "Nearby",
            vehicleNumber: u.additionalInfo?.vehicleNumber || "",
          } as DeliveryPerson;
        }),
      );
      console.log(
        `✅ [fetchAvailableDelivery] Processed ${deliveryData.length} delivery persons:`,
        deliveryData.map((d) => ({ name: d.name, uid: d.uid })),
      );
      setDeliveryPersons(deliveryData);
    } catch (error) {
      console.error("❌ [fetchAvailableDelivery] Error:", error);
    } finally {
      setLoadingDelivery(false);
    }
  };

  const handleAssignDelivery = async (person: DeliveryPerson) => {
    if (!testDetail) return;
    setIsAssigning(true);
    try {
      await LabTestService.assignDeliveryToRequest(
        testDetail.id,
        testDetail,
        person.uid,
        person.name,
      );
      toast.success(`Assigned ${person.name} successfully!`);
      setShowAssignModal(false);
      fetchTestDetail();
    } catch (error) {
      console.error("Error assigning delivery:", error);
      toast.error("Failed to assign delivery person");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleChatWithDelivery = async () => {
    if (!testDetail?.deliveryId || !currentUser) return;
    router.push({
      pathname: "/(lab)/lab-delivery-chat-detail",
      params: {
        deliveryId: testDetail.deliveryId,
        deliveryName: testDetail.deliveryName,
        deliveryAvatar: "https://via.placeholder.com/100",
      },
    });
  };

  const statusFlow: TestRequestStatus[] = [
    "pending",
    "accepted",
    "sample_collected",
    "processing",
    "report_ready",
    "completed",
  ];

  const getStatusDisplay = (status: TestRequestStatus) => {
    switch (status) {
      case "pending":
        return "New";
      case "accepted":
        return "Accepted";
      case "sample_collected":
        return "Sample Collected";
      case "processing":
        return "Processing";
      case "report_ready":
        return "Report Ready";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return colors.primary;
      case "accepted":
        return "#00BCD4";
      case "sample_collected":
        return "#FF9800";
      case "processing":
        return "#9C27B0";
      case "report_ready":
        return colors.primary;
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return colors.gray;
    }
  };

  const getNextStatus = (): TestRequestStatus | null => {
    if (!testDetail) return null;
    const currentIndex = statusFlow.indexOf(testDetail.status);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getNextActionLabel = () => {
    if (!testDetail) return null;
    switch (testDetail.status) {
      case "pending":
        return "Accept Request";
      case "accepted":
        return "Mark Sample Collected";
      case "sample_collected":
        return "Start Processing";
      case "processing":
        return "Mark Report Ready";
      case "report_ready":
        return "Complete Order";
      default:
        return null;
    }
  };

  const handleUpdateStatus = () => {
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus || !testDetail) return;

    try {
      await LabTestService.updateTestRequestStatus(
        testDetail.id,
        nextStatus,
        testDetail,
      );
      const actionMessages: Record<string, string> = {
        accepted: "Request accepted. Patient will be notified.",
        sample_collected: "Sample marked as collected.",
        processing: "Test is now being processed.",
        report_ready: "Report is ready for review.",
        completed: "Order completed successfully!",
      };

      setSuccessMessage(actionMessages[nextStatus] || "Status updated!");
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      fetchTestDetail();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCall = () => {
    if (testDetail) {
      toast.info(`Calling ${testDetail.userPhone}`);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.mainContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={{ color: colors.white, marginTop: 10 }}>
          Loading details...
        </Text>
      </View>
    );
  }

  if (!testDetail) {
    return (
      <View
        style={[
          styles.mainContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.white }}>Request not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text
            style={{ color: colors.white, textDecorationLine: "underline" }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, "#00D68F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Test Details</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(testDetail.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusDisplay(testDetail.status)}
              </Text>
            </View>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Progress */}
            <View style={styles.statusCard}>
              <Text style={styles.sectionTitle}>Status Progress</Text>
              <View style={styles.statusFlow}>
                {statusFlow.map((status, index) => {
                  const isCompleted =
                    statusFlow.indexOf(testDetail.status) >= index;
                  const isCurrent = testDetail.status === status;
                  return (
                    <View key={status} style={styles.statusStep}>
                      <View
                        style={[
                          styles.statusDot,
                          isCompleted && { backgroundColor: colors.primary },
                          isCurrent && styles.currentDot,
                        ]}
                      >
                        {isCompleted && !isCurrent && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.white}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.statusLabel,
                          isCompleted && { color: colors.primary },
                          isCurrent && { fontFamily: Fonts.bold },
                        ]}
                      >
                        {getStatusDisplay(status)}
                      </Text>
                      {index < statusFlow.length - 1 && (
                        <View
                          style={[
                            styles.statusLine,
                            isCompleted && { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Patient Info */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor:
                        testDetail.priority === "urgent" ||
                        testDetail.priority === "critical"
                          ? "#F44336" + "15"
                          : colors.primary + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color:
                          testDetail.priority === "urgent" ||
                          testDetail.priority === "critical"
                            ? "#F44336"
                            : colors.primary,
                      },
                    ]}
                  >
                    {testDetail.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.patientRow}>
                <View style={styles.avatarLarge}>
                  <Ionicons name="person" size={28} color={colors.white} />
                </View>
                <View style={styles.patientDetails}>
                  <Text style={styles.patientName}>{testDetail.userName}</Text>
                  <Text style={styles.patientContact}>
                    {testDetail.userPhone}
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <QuickActionButton
                  icon="call"
                  label="Call"
                  onPress={handleCall}
                />
                <QuickActionButton
                  icon="chatbubble"
                  label="Message"
                  onPress={() => toast.info("Messaging feature coming soon...")}
                />
              </View>
            </View>

            {/* Collection Details */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Collection Details</Text>

              <View style={styles.collectionTypeRow}>
                <View
                  style={[
                    styles.collectionBadge,
                    {
                      backgroundColor:
                        testDetail.collectionType === "home_sampling"
                          ? colors.primary
                          : "#9C27B0",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      testDetail.collectionType === "home_sampling"
                        ? "home"
                        : "business"
                    }
                    size={20}
                    color={colors.white}
                  />
                </View>
                <View>
                  <Text style={styles.collectionType}>
                    {testDetail.collectionType === "home_sampling"
                      ? "Home Sampling"
                      : "Lab Visit"}
                  </Text>
                  <Text style={styles.scheduleText}>
                    {testDetail.scheduledDate} at {testDetail.scheduledTime}
                  </Text>
                </View>
              </View>

              {testDetail.address && (
                <View style={styles.addressBox}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                  <Text style={styles.addressText}>{testDetail.address}</Text>
                </View>
              )}
            </View>

            {/* Test Details */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Test Details</Text>

              <View style={styles.detailRow}>
                <Ionicons name="flask" size={18} color={colors.gray} />
                <Text style={styles.detailLabel}>Test Type:</Text>
                <Text style={styles.detailValue}>{testDetail.testType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="water" size={18} color={colors.gray} />
                <Text style={styles.detailLabel}>Sample:</Text>
                <Text style={styles.detailValue}>{testDetail.sampleType}</Text>
              </View>

              {testDetail.doctorName && (
                <View style={styles.detailRow}>
                  <Ionicons name="medkit" size={18} color={colors.gray} />
                  <Text style={styles.detailLabel}>Doctor:</Text>
                  <Text style={styles.detailValue}>
                    {testDetail.doctorName}
                  </Text>
                </View>
              )}

              {testDetail.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{testDetail.notes}</Text>
                </View>
              )}
            </View>

            {/* Lab Delivery Boy Section */}
            {testDetail.collectionType === "home_sampling" && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Lab Delivery Boy</Text>
                  {!testDetail.deliveryId && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowAssignModal(true);
                        fetchAvailableDelivery();
                      }}
                      style={styles.assignLink}
                    >
                      <Text style={styles.assignLinkText}>Assign Now</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {testDetail.deliveryId ? (
                  <View>
                    <View style={styles.deliveryRow}>
                      <View style={styles.avatarSmall}>
                        <Ionicons
                          name="bicycle"
                          size={20}
                          color={colors.white}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deliveryName}>
                          {testDetail.deliveryName}
                        </Text>
                        <Text style={styles.deliveryStatus}>
                          Assigned Provider
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.chatIconBtn}
                        onPress={handleChatWithDelivery}
                      >
                        <Ionicons
                          name="chatbubbles"
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.unassignedBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color={colors.gray}
                    />
                    <Text style={styles.unassignedText}>
                      No delivery person assigned yet.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Bottom Action Button */}
        {getNextActionLabel() && (
          <View style={styles.bottomAction}>
            <AppButton
              title={getNextActionLabel()!}
              onPress={handleUpdateStatus}
              containerStyle={{
                ...styles.actionButton,
                backgroundColor: getStatusColor(getNextStatus()!),
              }}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Assignment Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.assignModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Delivery Boy</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingDelivery ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ margin: 40 }}
              />
            ) : deliveryPersons.length > 0 ? (
              <FlatList
                data={deliveryPersons}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                  <DeliveryPersonCard
                    {...item}
                    mode="booking"
                    onPress={() => handleAssignDelivery(item)}
                  />
                )}
                contentContainerStyle={{ padding: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            ) : (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: colors.gray, textAlign: "center" }}>
                  No approved delivery boys found.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setShowConfirmModal(false)}
        title="Update Status"
        message={`Are you sure you want to update status to "${getStatusDisplay(getNextStatus() || "pending")}"?`}
        icon="swap-horizontal-outline"
        type="info"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        icon="checkmark-circle-outline"
        type="success"
        confirmText="OK"
        showCancelButton={false}
      />
    </View>
  );
};

export default TestDetailScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingBottom: 120,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statusFlow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statusStep: {
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  currentDot: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  statusLabel: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: colors.gray,
    textAlign: "center",
  },
  statusLine: {
    position: "absolute",
    top: 11,
    left: "60%",
    right: "-40%",
    height: 2,
    backgroundColor: "#E0E0E0",
    zIndex: -1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 4,
  },
  patientContact: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  collectionTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  collectionBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionType: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  scheduleText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
  },
  notesBox: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#FF9800",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 14,
  },
  assignLink: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  assignLinkText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  unassignedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },
  unassignedText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  deliveryStatus: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  chatIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  assignModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
});
