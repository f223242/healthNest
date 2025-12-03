import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RecordType = "All" | "Lab Reports" | "Prescriptions";
type RecordStatus = "New" | "Viewed";

interface MedicalRecord {
  id: string;
  type: "Lab Report" | "Prescription";
  title: string;
  provider: string;
  providerImage: string;
  date: string;
  status: RecordStatus;
  doctor?: string;
  reportId: string;
  testCount?: number;
  downloadUrl?: string;
}

const medicalRecordsData: MedicalRecord[] = [
  {
    id: "1",
    type: "Lab Report",
    title: "Complete Blood Count (CBC)",
    provider: "LabCorp",
    providerImage: "https://img.freepik.com/free-photo/scientist-laboratory-analyzing-blood-sample_23-2148810467.jpg",
    date: "Nov 28, 2025",
    status: "New",
    doctor: "Dr. Amir Khan",
    reportId: "RPT-2024-001",
    testCount: 12,
  },
  {
    id: "2",
    type: "Lab Report",
    title: "Lipid Profile",
    provider: "Quest Diagnostics",
    providerImage: "https://img.freepik.com/free-photo/medical-technology-lab-science_23-2148896574.jpg",
    date: "Nov 25, 2025",
    status: "Viewed",
    doctor: "Dr. Sara Malik",
    reportId: "RPT-2024-002",
    testCount: 8,
  },
  {
    id: "3",
    type: "Lab Report",
    title: "Thyroid Function Test",
    provider: "Mayo Clinic Labs",
    providerImage: "https://img.freepik.com/free-photo/scientist-laboratory-analyzing-blood-sample_23-2148810467.jpg",
    date: "Nov 20, 2025",
    status: "Viewed",
    doctor: "Dr. Kamran Ahmed",
    reportId: "RPT-2024-003",
    testCount: 5,
  },
  {
    id: "4",
    type: "Lab Report",
    title: "HbA1c Test",
    provider: "LabCorp",
    providerImage: "https://img.freepik.com/free-photo/medical-technology-lab-science_23-2148896574.jpg",
    date: "Nov 15, 2025",
    status: "Viewed",
    doctor: "Dr. Usman Ali",
    reportId: "RPT-2024-004",
    testCount: 3,
  },
  {
    id: "5",
    type: "Lab Report",
    title: "Liver Function Test (LFT)",
    provider: "Quest Diagnostics",
    providerImage: "https://img.freepik.com/free-photo/scientist-laboratory-analyzing-blood-sample_23-2148810467.jpg",
    date: "Nov 12, 2025",
    status: "Viewed",
    doctor: "Dr. Fatima Noor",
    reportId: "RPT-2024-005",
    testCount: 10,
  },
  {
    id: "6",
    type: "Prescription",
    title: "Medication Prescription",
    provider: "City Hospital",
    providerImage: "https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg",
    date: "Nov 18, 2025",
    status: "Viewed",
    doctor: "Dr. Michael Chen",
    reportId: "PRE-2024-001",
  },
];

const MedicalRecord = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<RecordType>("All");

  const filterOptions: Array<{ label: RecordType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Lab Reports", icon: "flask" },
    { label: "Prescriptions", icon: "document-text" },
  ];

  const filteredRecords = medicalRecordsData
    .filter((record) => {
      const matchesSearch =
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.reportId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Lab Reports" && record.type === "Lab Report") ||
        (selectedFilter === "Prescriptions" && record.type === "Prescription");

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeIcon = (type: MedicalRecord["type"]): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "Lab Report":
        return "flask";
      case "Prescription":
        return "document-text";
      default:
        return "document";
    }
  };

  const getTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "Lab Report":
        return colors.primary;
      case "Prescription":
        return "#FF9800";
      default:
        return colors.gray;
    }
  };

  // Stats calculations
  const totalReports = medicalRecordsData.filter(r => r.type === "Lab Report").length;
  const newReports = medicalRecordsData.filter(r => r.status === "New").length;
  const prescriptions = medicalRecordsData.filter(r => r.type === "Prescription").length;

  const handleViewReport = (record: MedicalRecord) => {
    // Navigate to report detail screen
    console.log("View report:", record.id);
  };

  const handleDownloadReport = (record: MedicalRecord) => {
    // Download the report
    console.log("Download report:", record.id);
  };

  const handleShareReport = (record: MedicalRecord) => {
    // Share the report
    console.log("Share report:", record.id);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Search Bar */}
      <FormInput
        LeftIcon={SearchIcon}
        placeholder="Search records, labs, doctors..."
        containerStyle={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="flask"
          value={totalReports}
          label="Lab Reports"
          color={colors.primary}
        />
        <StatCard
          icon="notifications"
          value={newReports}
          label="New"
          color={colors.warning}
        />
        <StatCard
          icon="document-text"
          value={prescriptions}
          label="Prescriptions"
          color="#2196F3"
        />
      </View>

      {/* Filter Chips */}
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
            />
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredRecords.length} {filteredRecords.length === 1 ? "Record" : "Records"}
        </Text>
      </View>

      {/* Records List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              activeOpacity={0.7}
              onPress={() => handleViewReport(record)}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: record.providerImage }}
                      style={styles.providerImage}
                    />
                    <View
                      style={[
                        styles.typeIconBadge,
                        { backgroundColor: getTypeColor(record.type) + "20" },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(record.type)}
                        size={12}
                        color={getTypeColor(record.type)}
                      />
                    </View>
                  </View>

                  <View style={styles.headerInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.recordTitle} numberOfLines={1}>
                        {record.title}
                      </Text>
                      {record.status === "New" && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.provider}>{record.provider}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={colors.gray}
                      />
                      <Text style={styles.metaText}>{record.date}</Text>
                      {record.testCount && (
                        <>
                          <View style={styles.metaDivider} />
                          <Ionicons
                            name="list-outline"
                            size={12}
                            color={colors.gray}
                          />
                          <Text style={styles.metaText}>
                            {record.testCount} tests
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* Doctor Info */}
                {record.doctor && (
                  <View style={styles.doctorRow}>
                    <Ionicons
                      name="medical"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.doctorText}>
                      Referred by {record.doctor}
                    </Text>
                  </View>
                )}

                {/* Report ID */}
                <View style={styles.reportIdRow}>
                  <Text style={styles.reportIdLabel}>Report ID:</Text>
                  <Text style={styles.reportIdValue}>{record.reportId}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewReport(record)}
                  >
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadReport(record)}
                  >
                    <Ionicons
                      name="download-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.actionText}>Download</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareReport(record)}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptyText}>
              Your medical records will appear here when sent by labs
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MedicalRecord;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  filterContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  resultsHeader: {
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  recordCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  typeIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,
    flex: 1,
  },
  newBadge: {
    backgroundColor: colors.danger + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: colors.danger,
  },
  provider: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray,
    marginHorizontal: 6,
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  doctorText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  reportIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  reportIdLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  reportIdValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
