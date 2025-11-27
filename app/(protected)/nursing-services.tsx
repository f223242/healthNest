import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import NurseCard from "@/component/NurseCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
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

type ServiceType = "All" | "Elderly Care" | "Child Care" | "Patient Care" | "Post-Surgery";

const nursesData = [
  {
    id: "1",
    name: "Sarah Johnson",
    specialization: "Elderly Care Specialist",
    image: "https://img.freepik.com/free-photo/portrait-smiling-female-doctor_23-2148316706.jpg",
    rating: 4.8,
    reviewCount: 127,
    experience: "8+ years",
    availability: "Available" as const,
    serviceType: ["Elderly Care", "Patient Care", "Post-Surgery"],
    hourlyRate: "$25",
  },
  {
    id: "2",
    name: "Emily Williams",
    specialization: "Pediatric Nurse",
    image: "https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg",
    rating: 4.9,
    reviewCount: 203,
    experience: "6+ years",
    availability: "Available" as const,
    serviceType: ["Child Care", "Patient Care"],
    hourlyRate: "$28",
  },
  {
    id: "3",
    name: "Michael Chen",
    specialization: "Critical Care Nurse",
    image: "https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg",
    rating: 4.7,
    reviewCount: 156,
    experience: "10+ years",
    availability: "Busy" as const,
    serviceType: ["Patient Care", "Post-Surgery", "Elderly Care"],
    hourlyRate: "$32",
  },
  {
    id: "4",
    name: "Jennifer Martinez",
    specialization: "Home Care Specialist",
    image: "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
    rating: 4.6,
    reviewCount: 98,
    experience: "5+ years",
    availability: "Available" as const,
    serviceType: ["Elderly Care", "Patient Care"],
    hourlyRate: "$24",
  },
  {
    id: "5",
    name: "David Thompson",
    specialization: "Post-Operative Care",
    image: "https://img.freepik.com/free-photo/front-view-male-nurse-special-uniform_23-2148913848.jpg",
    rating: 4.9,
    reviewCount: 187,
    experience: "12+ years",
    availability: "Offline" as const,
    serviceType: ["Post-Surgery", "Patient Care"],
    hourlyRate: "$35",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    specialization: "Child Care Expert",
    image: "https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg",
    rating: 4.8,
    reviewCount: 142,
    experience: "7+ years",
    availability: "Available" as const,
    serviceType: ["Child Care", "Patient Care"],
    hourlyRate: "$26",
  },
];

const NursingServices = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ServiceType>("All");

  const filterOptions: Array<{ label: ServiceType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Elderly Care", icon: "accessibility" },
    { label: "Child Care", icon: "happy" },
    { label: "Patient Care", icon: "medical" },
    { label: "Post-Surgery", icon: "bandage" },
  ];

  const filteredNurses = nursesData.filter((nurse) => {
    const matchesSearch =
      nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "All" || nurse.serviceType.includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const handleChatPress = (nurse: typeof nursesData[0]) => {
    router.push({
      pathname: "/(protected)/medicine-chat",
      params: {
        personName: nurse.name,
        personAvatar: nurse.image,
        useTora: "false",
      },
    });
  };

  const handleViewProfile = (nurse: typeof nursesData[0]) => {
    router.push({
      pathname: "/(protected)/nurse-profile",
      params: {
        id: nurse.id,
        name: nurse.name,
        specialization: nurse.specialization,
        image: nurse.image,
        rating: nurse.rating.toString(),
        reviewCount: nurse.reviewCount.toString(),
        experience: nurse.experience,
        availability: nurse.availability,
        serviceType: JSON.stringify(nurse.serviceType),
        hourlyRate: nurse.hourlyRate,
      },
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Search Bar */}
      <FormInput
        LeftIcon={SearchIcon}
        placeholder="Search nurses by name or specialization..."
        containerStyle={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <StatCard
          icon="people"
          value={nursesData.length}
          label="Total Nurses"
          color={colors.primary}
        />
        <StatCard
          icon="checkmark-circle"
          value={nursesData.filter((n) => n.availability === "Available").length}
          label="Available Now"
          color={colors.success}
        />
        <StatCard
          icon="star"
          value="4.8"
          label="Avg Rating"
          color="#FF9800"
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
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
          {filteredNurses.length} {filteredNurses.length === 1 ? "Nurse" : "Nurses"} Found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="funnel" size={16} color={colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Nurses List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNurses.length > 0 ? (
          filteredNurses.map((nurse) => (
            <NurseCard
              key={nurse.id}
              {...nurse}
              onPress={() => handleViewProfile(nurse)}
              onChatPress={() => handleChatPress(nurse)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>No Nurses Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NursingServices;

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
  headerStats: {
    flexDirection: "row",
    paddingBottom: 16,
    gap: 12,
  },
  filtersContainer: {
    paddingBottom: 35,
    // backgroundColor:"red",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
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
  },
});
