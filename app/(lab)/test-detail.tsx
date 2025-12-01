import AppButton from "@/component/AppButton";
import ConfirmationModal from "@/component/ConfirmationModal";
import QuickActionButton from "@/component/QuickActionButton";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TestStatus = "New" | "Confirmed" | "Sample Collected" | "Processing" | "Report Ready" | "Sent";

interface TestDetail {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  testType: string;
  sampleType: string;
  collectionType: "Home Sampling" | "Lab Visit";
  scheduledDate: string;
  scheduledTime: string;
  priority: "Normal" | "Urgent" | "Critical";
  status: TestStatus;
  address?: string;
  doctor?: string;
  notes?: string;
  reportId?: string;
}

const TestDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Mock data - in real app, fetch based on id
  const [testDetail, setTestDetail] = useState<TestDetail>({
    id: id as string,
    patientName: "Ahmed Hassan",
    patientPhone: "+92 300 1234567",
    patientEmail: "ahmed@example.com",
    testType: "Complete Blood Count (CBC)",
    sampleType: "Blood",
    collectionType: "Home Sampling",
    scheduledDate: "Today",
    scheduledTime: "10:30 AM",
    priority: "Urgent",
    status: "New",
    address: "House 123, Block B, DHA Phase 5, Karachi",
    doctor: "Dr. Amir Khan",
    notes: "Patient is diabetic, fasting sample required",
  });

  const statusFlow: TestStatus[] = [
    "New",
    "Confirmed",
    "Sample Collected",
    "Processing",
    "Report Ready",
    "Sent",
  ];

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case "New": return "#2196F3";
      case "Confirmed": return "#00BCD4";
      case "Sample Collected": return "#FF9800";
      case "Processing": return "#9C27B0";
      case "Report Ready": return colors.primary;
      case "Sent": return colors.gray;
      default: return colors.gray;
    }
  };

  const getNextStatus = (): TestStatus | null => {
    const currentIndex = statusFlow.indexOf(testDetail.status);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getNextActionLabel = () => {
    switch (testDetail.status) {
      case "New": return "Confirm Request";
      case "Confirmed": return "Mark Sample Collected";
      case "Sample Collected": return "Start Processing";
      case "Processing": return "Mark Report Ready";
      case "Report Ready": return "Send to Patient";
      default: return null;
    }
  };

  const handleUpdateStatus = () => {
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    const actionMessages: Record<string, string> = {
      Confirmed: "Request confirmed. Patient will be notified.",
      "Sample Collected": "Sample marked as collected.",
      Processing: "Test is now being processed.",
      "Report Ready": "Report is ready for review.",
      Sent: "Report sent to patient successfully!",
    };

    setTestDetail({ ...testDetail, status: nextStatus });
    setShowConfirmModal(false);
    setSuccessMessage(actionMessages[nextStatus]);
    setShowSuccessModal(true);
  };

  const handleCall = () => {
    Alert.alert("Call Patient", `Calling ${testDetail.patientPhone}`);
  };

  const handleNavigate = () => {
    Alert.alert("Navigate", "Opening maps for navigation...");
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Progress */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Status Progress</Text>
          <View style={styles.statusFlow}>
            {statusFlow.map((status, index) => {
              const isCompleted = statusFlow.indexOf(testDetail.status) >= index;
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
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.statusLabel,
                      isCompleted && { color: colors.primary },
                      isCurrent && { fontFamily: Fonts.bold },
                    ]}
                  >
                    {status}
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
                { backgroundColor: testDetail.priority === "Urgent" ? "#F44336" + "15" : colors.primary + "15" },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: testDetail.priority === "Urgent" ? "#F44336" : colors.primary },
                ]}
              >
                {testDetail.priority}
              </Text>
            </View>
          </View>

          <View style={styles.patientRow}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person" size={28} color={colors.white} />
            </View>
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>{testDetail.patientName}</Text>
              <Text style={styles.patientContact}>{testDetail.patientPhone}</Text>
              <Text style={styles.patientContact}>{testDetail.patientEmail}</Text>
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
              onPress={() => Alert.alert("Message", "Opening messaging...")}
            />
            {testDetail.collectionType === "Home Sampling" && (
              <QuickActionButton
                icon="navigate"
                label="Navigate"
                onPress={handleNavigate}
              />
            )}
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
                    testDetail.collectionType === "Home Sampling" ? "#2196F3" : "#9C27B0",
                },
              ]}
            >
              <Ionicons
                name={testDetail.collectionType === "Home Sampling" ? "home" : "business"}
                size={20}
                color={colors.white}
              />
            </View>
            <View>
              <Text style={styles.collectionType}>{testDetail.collectionType}</Text>
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

          {testDetail.doctor && (
            <View style={styles.detailRow}>
              <Ionicons name="medkit" size={18} color={colors.gray} />
              <Text style={styles.detailLabel}>Doctor:</Text>
              <Text style={styles.detailValue}>{testDetail.doctor}</Text>
            </View>
          )}

          {testDetail.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{testDetail.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

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

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmStatusUpdate}
        title="Update Status"
        message={`Are you sure you want to update status to "${getNextStatus()}"?`}
        icon="swap-horizontal-outline"
        variant="primary"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        icon="checkmark-circle-outline"
        variant="success"
        confirmText="OK"
        showCancelButton={false}
      />
    </SafeAreaView>
  );
};

export default TestDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingBottom: 100,
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
});
