import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Report {
  id: string;
  patientName: string;
  patientPhone: string;
  testType: string;
  collectionType: "Home Sampling" | "Lab Visit";
  reportDate: string;
  status: "Processing" | "Ready" | "Sent";
  reportId: string;
  doctor?: string;
}

const Reports = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filters = ["All", "Ready", "Sent", "Processing"];

  const reports: Report[] = [
    {
      id: "1",
      patientName: "Ahmed Hassan",
      patientPhone: "+92 300 1234567",
      testType: "Complete Blood Count (CBC)",
      collectionType: "Home Sampling",
      reportDate: "Today, 11:30 AM",
      status: "Ready",
      reportId: "RPT-2024-001",
      doctor: "Dr. Amir Khan",
    },
    {
      id: "2",
      patientName: "Fatima Ali",
      patientPhone: "+92 301 2345678",
      testType: "Liver Function Test",
      collectionType: "Lab Visit",
      reportDate: "Today, 10:15 AM",
      status: "Ready",
      reportId: "RPT-2024-002",
      doctor: "Dr. Sara Malik",
    },
    {
      id: "3",
      patientName: "Imran Shah",
      patientPhone: "+92 302 3456789",
      testType: "Urine Analysis",
      collectionType: "Home Sampling",
      reportDate: "Yesterday, 05:30 PM",
      status: "Sent",
      reportId: "RPT-2024-003",
    },
    {
      id: "4",
      patientName: "Ayesha Noor",
      patientPhone: "+92 303 4567890",
      testType: "COVID-19 PCR",
      collectionType: "Home Sampling",
      reportDate: "Yesterday, 03:00 PM",
      status: "Ready",
      reportId: "RPT-2024-004",
      doctor: "Dr. Kamran Ahmed",
    },
    {
      id: "5",
      patientName: "Bilal Khan",
      patientPhone: "+92 304 5678901",
      testType: "Thyroid Profile",
      collectionType: "Lab Visit",
      reportDate: "Yesterday, 12:00 PM",
      status: "Sent",
      reportId: "RPT-2024-005",
    },
    {
      id: "6",
      patientName: "Zainab Fatima",
      patientPhone: "+92 305 6789012",
      testType: "HbA1c Test",
      collectionType: "Lab Visit",
      reportDate: "2 days ago",
      status: "Processing",
      reportId: "RPT-2024-006",
      doctor: "Dr. Usman Ali",
    },
  ];

  const handleSendReport = (report: Report) => {
    Alert.alert(
      "Send Report",
      `Send report to ${report.patientName}?\n\nThe report will be sent via:\n• App notification\n• SMS to ${report.patientPhone}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("Success", "Report sent successfully to patient!");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return colors.primary;
      case "Sent":
        return "#2196F3";
      case "Processing":
        return "#FF9800";
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready":
        return "checkmark-circle";
      case "Sent":
        return "paper-plane";
      case "Processing":
        return "hourglass";
      default:
        return "document";
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || report.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient, test or report ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color={colors.gray} />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
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
              <View style={styles.reportHeader}>
                <View style={styles.reportIcon}>
                  <Ionicons name="document-text" size={22} color={colors.primary} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportId}>{report.reportId}</Text>
                  <Text style={styles.reportDate}>{report.reportDate}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) + "15" },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(report.status)}
                    size={12}
                    color={getStatusColor(report.status)}
                  />
                  <Text
                    style={[styles.statusText, { color: getStatusColor(report.status) }]}
                  >
                    {report.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Patient Info */}
              <View style={styles.patientRow}>
                <View style={styles.patientAvatar}>
                  <Ionicons name="person" size={16} color={colors.white} />
                </View>
                <View style={styles.patientDetails}>
                  <Text style={styles.patientName}>{report.patientName}</Text>
                  <Text style={styles.patientPhone}>{report.patientPhone}</Text>
                </View>
                <View
                  style={[
                    styles.collectionBadge,
                    {
                      backgroundColor:
                        report.collectionType === "Home Sampling"
                          ? "#2196F3" + "15"
                          : "#9C27B0" + "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={report.collectionType === "Home Sampling" ? "home" : "business"}
                    size={12}
                    color={
                      report.collectionType === "Home Sampling" ? "#2196F3" : "#9C27B0"
                    }
                  />
                </View>
              </View>

              <View style={styles.reportDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="flask-outline" size={16} color={colors.gray} />
                  <Text style={styles.detailValue}>{report.testType}</Text>
                </View>
                {report.doctor && (
                  <View style={styles.detailRow}>
                    <Ionicons name="medkit-outline" size={16} color={colors.gray} />
                    <Text style={styles.detailValue}>{report.doctor}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.viewButton}>
                  <Ionicons name="eye-outline" size={16} color={colors.primary} />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>

                {report.status === "Ready" ? (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleSendReport(report)}
                  >
                    <Ionicons name="send" size={16} color={colors.white} />
                    <Text style={styles.sendButtonText}>Send to Patient</Text>
                  </TouchableOpacity>
                ) : report.status === "Sent" ? (
                  <View style={styles.sentIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.sentText}>Delivered</Text>
                  </View>
                ) : (
                  <View style={styles.processingIndicator}>
                    <Ionicons name="hourglass-outline" size={16} color="#FF9800" />
                    <Text style={styles.processingText}>Processing...</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 10,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginTop: 12,
  },
  reportCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportId: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 12,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  patientPhone: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  collectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  reportDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 6,
  },
  sendButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  sentIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  sentText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  processingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  processingText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: "#FF9800",
  },
});
