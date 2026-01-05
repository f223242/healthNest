import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService, { Complaint, ComplaintStatus } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Status configuration
const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: "Pending", color: "#FFA500", icon: "time" },
  in_progress: { label: "In Progress", color: "#2196F3", icon: "hourglass" },
  resolved: { label: "Resolved", color: "#4CAF50", icon: "checkmark-circle" },
  rejected: { label: "Rejected", color: "#F44336", icon: "close-circle" },
  escalated: { label: "Escalated", color: "#9C27B0", icon: "arrow-up-circle" },
};

const MyComplaintsScreen = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use real-time listener for complaints
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = FeedbackComplaintService.listenToUserComplaints(
      user.uid,
      (data) => {
        setComplaints(data);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    // The real-time listener will automatically update
    setTimeout(() => setRefreshing(false), 1000);
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

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"]}
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
          <Text style={styles.headerTitle}>My Complaints</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          Track the status of your submitted complaints
        </Text>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No Complaints</Text>
              <Text style={styles.emptySubtitle}>
                You haven't submitted any complaints yet
              </Text>
              <TouchableOpacity
                style={styles.newComplaintBtn}
                onPress={() => router.push("/(protected)/complain")}
              >
                <Text style={styles.newComplaintText}>Submit a Complaint</Text>
              </TouchableOpacity>
            </View>
          ) : (
            complaints.map((complaint) => {
              const config = statusConfig[complaint.status];
              return (
                <View key={complaint.id} style={styles.complaintCard}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {complaint.category.replace("_", " ").toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + "15" }]}>
                      <Ionicons name={config.icon} size={14} color={config.color} />
                      <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>

                  {/* Subject */}
                  <Text style={styles.subject}>{complaint.subject}</Text>

                  {/* Description */}
                  <Text style={styles.description} numberOfLines={2}>
                    {complaint.description}
                  </Text>

                  {/* Meta Info */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.gray} />
                      <Text style={styles.metaText}>
                        {formatDate(complaint.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flag-outline" size={14} color={colors.gray} />
                      <Text style={styles.metaText}>
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                      </Text>
                    </View>
                  </View>

                  {/* Resolution (if resolved) */}
                  {complaint.status === "resolved" && complaint.resolution && (
                    <View style={styles.resolutionBox}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <View style={styles.resolutionContent}>
                        <Text style={styles.resolutionTitle}>Resolution</Text>
                        <Text style={styles.resolutionText}>{complaint.resolution}</Text>
                      </View>
                    </View>
                  )}

                  {/* Timeline (last event) */}
                  {complaint.timeline && complaint.timeline.length > 0 && (
                    <View style={styles.timelineBox}>
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text style={styles.timelineText}>
                        {complaint.timeline[complaint.timeline.length - 1].action}
                        {" - "}
                        {formatDate(complaint.timeline[complaint.timeline.length - 1].timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default MyComplaintsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.gray,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: colors.black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: "center",
  },
  newComplaintBtn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  newComplaintText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  complaintCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  subject: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
  },
  resolutionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  resolutionContent: {
    flex: 1,
  },
  resolutionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: colors.success,
    marginBottom: 4,
  },
  resolutionText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.black,
    lineHeight: 18,
  },
  timelineBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  timelineText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
    flex: 1,
  },
});
