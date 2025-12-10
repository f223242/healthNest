import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LAB_THEME_COLOR = '#0891B2';

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

  const toast = useToast();

  const handleSendReport = (report: Report) => {
    // Send report logic
    toast.success(`Report sent successfully to ${report.patientName}!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return '#0891B2';
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

  const filterOptions: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Ready", icon: "checkmark-circle" },
    { label: "Sent", icon: "paper-plane" },
    { label: "Processing", icon: "hourglass" },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={LAB_THEME_COLOR} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[LAB_THEME_COLOR, '#06B6D4', '#22D3EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>{filteredReports.length} reports found</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        {/* Search Bar */}
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search by patient, test or report ID..."
          containerStyle={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                icon={filter.icon}
                isActive={selectedFilter === filter.label}
                onPress={() => setSelectedFilter(filter.label)}
                accentColor={LAB_THEME_COLOR}
              />
            ))}
          </ScrollView>
        </View>

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
                    <Ionicons name="document-text" size={22} color="#0891B2" />
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
                    <Ionicons name="eye-outline" size={16} color="#0891B2" />
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
                      <Ionicons name="checkmark-circle" size={16} color="#0891B2" />
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
    </View>
  );
};

export default Reports;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: LAB_THEME_COLOR,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
    zIndex: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
  },
  searchInput: {
    marginHorizontal: sizes.paddingHorizontal,
    marginTop: 16,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 10,
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
    backgroundColor: '#0891B2' + "15",
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
    backgroundColor: '#0891B2',
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
    borderColor: '#0891B2',
    gap: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#0891B2',
  },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0891B2',
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
    color: '#0891B2',
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
