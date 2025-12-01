import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TestRequest {
  id: string;
  patientName: string;
  testType: string;
  collectionType: "Home Sampling" | "Lab Visit";
  scheduledTime: string;
  status: "New" | "Sample Collected" | "Processing" | "Report Ready" | "Sent";
  priority: "Normal" | "Urgent";
  address?: string;
}

const LabDashboard = () => {
  const router = useRouter();

  const stats = [
    {
      icon: "home",
      label: "Home Sampling",
      value: "8",
      color: "#2196F3",
    },
    {
      icon: "business",
      label: "Lab Visits",
      value: "15",
      color: "#9C27B0",
    },
    {
      icon: "flask",
      label: "Processing",
      value: "12",
      color: "#FF9800",
    },
    {
      icon: "send",
      label: "Ready to Send",
      value: "6",
      color: colors.primary,
    },
  ];

  const todayRequests: TestRequest[] = [
    {
      id: "1",
      patientName: "Ahmed Khan",
      testType: "Complete Blood Count",
      collectionType: "Home Sampling",
      scheduledTime: "10:30 AM",
      status: "New",
      priority: "Urgent",
      address: "House 123, Block B, DHA Phase 5",
    },
    {
      id: "2",
      patientName: "Sara Ali",
      testType: "Liver Function Test",
      collectionType: "Lab Visit",
      scheduledTime: "11:00 AM",
      status: "New",
      priority: "Normal",
    },
    {
      id: "3",
      patientName: "Imran Shah",
      testType: "Thyroid Profile",
      collectionType: "Home Sampling",
      scheduledTime: "12:30 PM",
      status: "Sample Collected",
      priority: "Normal",
      address: "Flat 45, Gulshan Heights",
    },
  ];

  const reportsReady: TestRequest[] = [
    {
      id: "5",
      patientName: "Bilal Hassan",
      testType: "COVID-19 PCR",
      collectionType: "Home Sampling",
      scheduledTime: "Yesterday",
      status: "Report Ready",
      priority: "Urgent",
    },
    {
      id: "6",
      patientName: "Zainab Fatima",
      testType: "Urine Analysis",
      collectionType: "Lab Visit",
      scheduledTime: "Yesterday",
      status: "Report Ready",
      priority: "Normal",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "#2196F3";
      case "Sample Collected":
        return "#FF9800";
      case "Processing":
        return "#9C27B0";
      case "Report Ready":
        return colors.primary;
      case "Sent":
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const getCollectionIcon = (type: string) => {
    return type === "Home Sampling" ? "home" : "business";
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Requests</Text>
            <TouchableOpacity
              onPress={() => router.push("/(lab)/(tabs)/test-requests")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() =>
                router.push({
                  pathname: "/(lab)/test-detail" as any,
                  params: { id: request.id },
                })
              }
            >
              <View style={styles.requestHeader}>
                <View style={styles.patientInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={18} color={colors.white} />
                  </View>
                  <View>
                    <Text style={styles.patientName}>{request.patientName}</Text>
                    <Text style={styles.testType}>{request.testType}</Text>
                  </View>
                </View>
                {request.priority === "Urgent" && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name={getCollectionIcon(request.collectionType)}
                    size={16}
                    color={colors.gray}
                  />
                  <Text style={styles.detailText}>{request.collectionType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={colors.gray} />
                  <Text style={styles.detailText}>{request.scheduledTime}</Text>
                </View>
              </View>

              {request.address && (
                <View style={styles.addressContainer}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.gray}
                  />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {request.address}
                  </Text>
                </View>
              )}

              <View style={styles.requestFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) },
                    ]}
                  >
                    {request.status}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.gray}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reports Ready to Send */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ready to Send</Text>
            <TouchableOpacity
              onPress={() => router.push("/(lab)/(tabs)/reports")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {reportsReady.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() =>
                router.push({
                  pathname: "/(lab)/test-detail" as any,
                  params: { id: report.id },
                })
              }
            >
              <View style={styles.reportInfo}>
                <View style={styles.reportIconContainer}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.reportPatient}>{report.patientName}</Text>
                  <Text style={styles.reportTest}>{report.testType}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="send" size={16} color={colors.white} />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabDashboard;

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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
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
  viewAll: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  patientName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  testType: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: "#F44336" + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  urgentText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#F44336",
  },
  requestDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.text,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  reportInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportPatient: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  reportTest: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  sendButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
