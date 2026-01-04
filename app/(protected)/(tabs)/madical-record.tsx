import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import MedicalRecordCard from "@/component/MedicalRecordCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import MedicalRecordService, { MedicalRecord as MedicalRecordType, RecordType as RecordTypeEnum } from "@/services/MedicalRecordService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "All" | "Lab Reports" | "Prescriptions" | "Diagnoses";

const MedicalRecordScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [records, setRecords] = useState<MedicalRecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = MedicalRecordService.listenToUserRecords(
      user.uid,
      (fetchedRecords) => {
        console.log('[Records] fetched ->', fetchedRecords.length);
        setRecords(fetchedRecords);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const filterOptions: Array<{ label: FilterType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Lab Reports", icon: "flask" },
    { label: "Prescriptions", icon: "document-text" },
    { label: "Diagnoses", icon: "medkit" },
  ];

  const mapFilterToType = (filter: FilterType): RecordTypeEnum | null => {
    switch (filter) {
      case "Lab Reports": return "lab_report";
      case "Prescriptions": return "prescription";
      case "Diagnoses": return "diagnosis";
      default: return null;
    }
  };

  const getRecordTypeLabel = (type: RecordTypeEnum): string => {
    switch (type) {
      case "lab_report": return "Lab Report";
      case "prescription": return "Prescription";
      case "diagnosis": return "Diagnosis";
      case "imaging": return "Imaging";
      default: return "Other";
    }
  };

  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const filterType = mapFilterToType(selectedFilter);
      const matchesFilter = filterType === null || record.type === filterType;

      return matchesSearch && matchesFilter;
    });

  // Stats calculations
  const totalReports = records.filter(r => r.type === "lab_report").length;
  const newReports = records.filter(r => r.status === "new").length;

  const handleViewReport = async (record: MedicalRecordType) => {
    if (record.status === "new") {
      try {
        await MedicalRecordService.markAsViewed(record.id);
      } catch (error) {
        console.error("Error marking as viewed:", error);
      }
    }
    console.log("View report:", record.id);
  };

  const handleDownloadReport = (record: MedicalRecordType) => {
    if (record.fileUrl) {
      console.log("Download report:", record.fileUrl);
    }
  };

  const handleShareReport = (record: MedicalRecordType) => {
    console.log("Share report:", record.id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading medical records...</Text>
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              id={record.id}
              type={getRecordTypeLabel(record.type)}
              title={record.title}
              provider={record.providerName}
              providerImage={record.providerImage || ""}
              date={record.date}
              status={record.status === "new" ? "New" : "Viewed"}
              doctor={record.doctorName}
              reportId={record.id.substring(0, 12)}
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

export default MedicalRecordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 12,
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
