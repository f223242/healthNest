import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TestRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  testType: string;
  sampleType: string;
  collectionType: "Home Sampling" | "Lab Visit";
  scheduledTime: string;
  scheduledDate: string;
  priority: "Normal" | "Urgent" | "Critical";
  status: "New" | "Confirmed" | "Sample Collected" | "Processing" | "Report Ready" | "Sent";
  address?: string;
  doctor?: string;
}

const TestRequests = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const filters = ["All", "New", "Confirmed", "Sample Collected", "Processing"];
  const typeFilters = ["All", "Home Sampling", "Lab Visit"];

  const testRequests: TestRequest[] = [
    {
      id: "1",
      patientName: "Ahmed Hassan",
      patientPhone: "+92 300 1234567",
      testType: "Complete Blood Count (CBC)",
      sampleType: "Blood",
      collectionType: "Home Sampling",
      scheduledTime: "10:30 AM",
      scheduledDate: "Today",
      priority: "Urgent",
      status: "New",
      address: "House 123, Block B, DHA Phase 5, Karachi",
      doctor: "Dr. Amir Khan",
    },
    {
      id: "2",
      patientName: "Fatima Ali",
      patientPhone: "+92 301 2345678",
      testType: "Liver Function Test",
      sampleType: "Blood",
      collectionType: "Lab Visit",
      scheduledTime: "11:00 AM",
      scheduledDate: "Today",
      priority: "Normal",
      status: "Confirmed",
      doctor: "Dr. Sara Malik",
    },
    {
      id: "3",
      patientName: "Imran Shah",
      patientPhone: "+92 302 3456789",
      testType: "Urine Analysis",
      sampleType: "Urine",
      collectionType: "Home Sampling",
      scheduledTime: "02:30 PM",
      scheduledDate: "Today",
      priority: "Normal",
      status: "Sample Collected",
      address: "Flat 45, Gulshan Heights, Lahore",
    },
    {
      id: "4",
      patientName: "Ayesha Noor",
      patientPhone: "+92 303 4567890",
      testType: "COVID-19 PCR",
      sampleType: "Swab",
      collectionType: "Home Sampling",
      scheduledTime: "09:00 AM",
      scheduledDate: "Tomorrow",
      priority: "Critical",
      status: "New",
      address: "House 78, Model Town, Islamabad",
      doctor: "Dr. Kamran Ahmed",
    },
    {
      id: "5",
      patientName: "Bilal Khan",
      patientPhone: "+92 304 5678901",
      testType: "Thyroid Profile",
      sampleType: "Blood",
      collectionType: "Lab Visit",
      scheduledTime: "03:00 PM",
      scheduledDate: "Today",
      priority: "Normal",
      status: "Processing",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#F44336';
      case 'Urgent': return '#FF9800';
      case 'Normal': return colors.primary;
      default: return colors.gray;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "#2196F3";
      case "Confirmed":
        return "#00BCD4";
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

  const filteredRequests = testRequests.filter((request) => {
    const matchesSearch =
      request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.testType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || request.status === selectedFilter;
    const matchesType =
      selectedType === "All" || request.collectionType === selectedType;
    return matchesSearch && matchesFilter && matchesType;
  });

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient or test..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray}
          />
        </View>
      </View>

      {/* Type Filter (Home Sampling / Lab Visit) */}
      <View style={styles.typeFilterContainer}>
        {typeFilters.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeFilterTab,
              selectedType === type && styles.typeFilterTabActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Ionicons
              name={
                type === "Home Sampling"
                  ? "home"
                  : type === "Lab Visit"
                  ? "business"
                  : "apps"
              }
              size={16}
              color={selectedType === type ? colors.white : colors.gray}
            />
            <Text
              style={[
                styles.typeFilterText,
                selectedType === type && styles.typeFilterTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filter Tabs */}
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

      {/* Requests List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={60} color={colors.gray} />
            <Text style={styles.emptyText}>No requests found</Text>
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
                    <Text style={styles.patientName}>{request.patientName}</Text>
                    <Text style={styles.patientPhone}>{request.patientPhone}</Text>
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
                    {request.priority}
                  </Text>
                </View>
              </View>

              {/* Collection Type Badge */}
              <View style={styles.collectionTypeBadge}>
                <Ionicons
                  name={request.collectionType === "Home Sampling" ? "home" : "business"}
                  size={14}
                  color={request.collectionType === "Home Sampling" ? "#2196F3" : "#9C27B0"}
                />
                <Text
                  style={[
                    styles.collectionTypeText,
                    {
                      color:
                        request.collectionType === "Home Sampling"
                          ? "#2196F3"
                          : "#9C27B0",
                    },
                  ]}
                >
                  {request.collectionType}
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
                {request.doctor && (
                  <View style={styles.testRow}>
                    <Ionicons name="medkit-outline" size={16} color={colors.gray} />
                    <Text style={styles.testLabel}>Referred by: {request.doctor}</Text>
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
                    {request.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestRequests;

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
  typeFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 8,
    gap: 10,
  },
  typeFilterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    gap: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  typeFilterTabActive: {
    backgroundColor: colors.primary,
  },
  typeFilterText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  typeFilterTextActive: {
    color: colors.white,
  },
  filterContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
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
    fontSize: 12,
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
