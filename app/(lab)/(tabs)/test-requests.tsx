import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import LabTestService, { LabTestRequest, TestRequestStatus } from "@/services/LabTestService";
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

const LAB_THEME_COLOR = colors.primary;

const TestRequests = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [testRequests, setTestRequests] = useState<LabTestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = LabTestService.listenToLabTestRequests(
      user.uid,
      (requests) => {
        console.log('[Lab] testRequests ->', requests.length);
        setTestRequests(requests);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'urgent': return '#FF9800';
      case 'normal': return colors.primary;
      default: return colors.gray;
    }
  };

  const getStatusColor = (status: TestRequestStatus) => {
    switch (status) {
      case "pending": return "#2196F3";
      case "accepted": return "#00BCD4";
      case "sample_collected": return "#FF9800";
      case "processing": return "#9C27B0";
      case "report_ready": return colors.primary;
      case "completed": return "#4CAF50";
      case "cancelled": return colors.gray;
      default: return colors.gray;
    }
  };

  const getStatusLabel = (status: TestRequestStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "accepted": return "Accepted";
      case "sample_collected": return "Sample Collected";
      case "processing": return "Processing";
      case "report_ready": return "Report Ready";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const filteredRequests = testRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.testType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || getStatusLabel(request.status) === selectedFilter;
    const matchesType =
      selectedType === "All" || 
      (selectedType === "Home Sampling" && request.collectionType === "home_sampling") ||
      (selectedType === "Lab Visit" && request.collectionType === "lab_visit");
    return matchesSearch && matchesFilter && matchesType;
  });

  const typeFilterOptions: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Home Sampling", icon: "home" },
    { label: "Lab Visit", icon: "business" },
  ];

  const statusFilterOptions: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Pending", icon: "alert-circle" },
    { label: "Accepted", icon: "checkmark-circle" },
    { label: "Sample Collected", icon: "flask" },
    { label: "Processing", icon: "hourglass" },
    { label: "Report Ready", icon: "document-text" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading test requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={LAB_THEME_COLOR} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[LAB_THEME_COLOR, '#00B976', '#00D68F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Test Requests</Text>
            <Text style={styles.headerSubtitle}>{filteredRequests.length} requests found</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        {/* Search Bar */}
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search patient or test..."
          containerStyle={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Type Filter (Home Sampling / Lab Visit) */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFilterContainer}
          >
            {typeFilterOptions.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                icon={filter.icon}
                isActive={selectedType === filter.label}
                onPress={() => setSelectedType(filter.label)}
                accentColor={LAB_THEME_COLOR}
              />
            ))}
          </ScrollView>
        </View>

        {/* Status Filter Tabs */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {statusFilterOptions.map((filter) => (
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

        {/* Requests List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flask-outline" size={60} color={colors.gray} />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>Test requests from patients will appear here</Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
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
                      <Ionicons name="person" size={20} color={colors.white} />
                    </View>
                    <View>
                      <Text style={styles.patientName}>{request.userName}</Text>
                      <Text style={styles.patientPhone}>{request.userPhone}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(request.priority) + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(request.priority) },
                      ]}
                    >
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Collection Type Badge */}
                <View style={styles.collectionTypeBadge}>
                  <Ionicons
                    name={request.collectionType === "home_sampling" ? "home" : "business"}
                    size={14}
                    color={request.collectionType === "home_sampling" ? colors.primary : "#9C27B0"}
                  />
                  <Text
                    style={[
                      styles.collectionTypeText,
                      {
                        color:
                          request.collectionType === "home_sampling"
                            ? colors.primary
                            : "#9C27B0",
                      },
                    ]}
                  >
                    {request.collectionType === "home_sampling" ? "Home Sampling" : "Lab Visit"}
                  </Text>
                  <Text style={styles.scheduledTime}>
                    • {request.scheduledDate}, {request.scheduledTime}
                  </Text>
                </View>

                <View style={styles.testInfo}>
                  <View style={styles.testRow}>
                    <Ionicons name="flask-outline" size={16} color={colors.gray} />
                    <Text style={styles.testLabel}>{request.testType}</Text>
                  </View>
                  <View style={styles.testRow}>
                    <Ionicons name="water-outline" size={16} color={colors.gray} />
                    <Text style={styles.testLabel}>Sample: {request.sampleType}</Text>
                  </View>
                  {request.doctorName && (
                    <View style={styles.testRow}>
                      <Ionicons name="medkit-outline" size={16} color={colors.gray} />
                      <Text style={styles.testLabel}>Referred by: {request.doctorName}</Text>
                    </View>
                  )}
                </View>

                {request.address && (
                  <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={14} color={colors.gray} />
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
                      style={[styles.statusText, { color: getStatusColor(request.status) }]}
                    >
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TestRequests;

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
  typeFilterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 8,
  },
  filterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 8,
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
  emptySubtext: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
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
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  patientName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  collectionTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  collectionTypeText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  scheduledTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  testInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  testRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  testLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    backgroundColor: "#FFF3E0",
    padding: 10,
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
});
