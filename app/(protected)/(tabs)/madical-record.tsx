import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import MedicalRecordCard from "@/component/MedicalRecordCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

];

const MedicalRecord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<RecordType>("All");
  const router = useRouter();

  const filterOptions: Array<{ label: RecordType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Lab Reports", icon: "flask" },

  ];

  const filteredRecords = medicalRecordsData
    .filter((record) => {
      const matchesSearch =
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.reportId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Lab Reports" && record.type === "Lab Report") ;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Stats calculations
  const totalReports = medicalRecordsData.filter(r => r.type === "Lab Report").length;
  const newReports = medicalRecordsData.filter(r => r.status === "New").length;
 

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
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00B976', '#00D68F'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Medical Records</Text>
            <TouchableOpacity onPress={() => router.push("/(protected)/notifications") }>
              <Ionicons name="notifications-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

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
     
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScrollView}
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
            <MedicalRecordCard
              key={record.id}
              id={record.id}
              type={record.type}
              title={record.title}
              provider={record.provider}
              providerImage={record.providerImage}
              date={record.date}
              status={record.status}
              doctor={record.doctor}
              reportId={record.reportId}
              testCount={record.testCount}
              onPress={() => handleViewReport(record)}
              onView={() => handleViewReport(record)}
              onDownload={() => handleDownloadReport(record)}
              onShare={() => handleShareReport(record)}
            />
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
  headerGradient: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: sizes.paddingHorizontal,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 6,
    marginHorizontal: -sizes.paddingHorizontal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
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
    marginBottom: 36,
  },
  filterScrollView: {
    marginBottom: 4,
    
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
