import { SearchIcon } from "@/assets/svg";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import NurseCard from "@/component/NurseCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { NurseInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

type ServiceType = "All" | "Elderly Care" | "Child Care" | "Patient Care" | "Post-Surgery";

// Transform Firebase nurse data to card format
interface NurseCardData {
  id: string;
  name: string;
  specialization: string;
  image: string | null;
  experience: string;
  availability: "Available" | "Busy" | "Offline";
  hourlyRate: string;
  city: string;
  certifications: string;
}

const NursingServices = () => {
  const router = useRouter();
  const { getAllUsers } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ServiceType>("All");
  const [nurses, setNurses] = useState<NurseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions: Array<{ label: ServiceType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Elderly Care", icon: "accessibility" },
    { label: "Child Care", icon: "happy" },
    { label: "Patient Care", icon: "medical" },
    { label: "Post-Surgery", icon: "bandage" },
  ];

  // Fetch nurses from Firebase
  const fetchNurses = useCallback(async () => {
    try {
      const users = await getAllUsers("Nurse");
      const nursesData: NurseCardData[] = users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map((user: User) => {
          const info = user.additionalInfo as NurseInfo;
          const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Nurse";
          
          // Map availability string to proper type
          let availability: "Available" | "Busy" | "Offline" = "Offline";
          if (info.availability) {
            const avail = info.availability.toLowerCase();
            if (avail === "available" || avail === "full-time" || avail === "part-time") {
              availability = "Available";
            } else if (avail === "busy" || avail === "on-call") {
              availability = "Busy";
            }
          }
          
          return {
            id: user.uid,
            name: fullName,
            specialization: info.specialization || "General Nursing",
            image: info.profileImage || null,
            experience: info.experience || "N/A",
            availability,
            hourlyRate: info.hourlyRate ? `$${info.hourlyRate}` : "N/A",
            city: info.city || "",
            certifications: info.certifications || "",
          };
        });
      
      setNurses(nursesData);
    } catch (error) {
      console.error("Error fetching nurses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchNurses();
  }, [fetchNurses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNurses();
  }, [fetchNurses]);

  // Filter nurses based on search and filter
  const filteredNurses = useMemo(() => {
    return nurses.filter((nurse) => {
      const matchesSearch =
        nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" || 
        nurse.specialization.toLowerCase().includes(selectedFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [nurses, searchQuery, selectedFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = nurses.length;
    const available = nurses.filter((n) => n.availability === "Available").length;
    return { total, available };
  }, [nurses]);

  const handleChatPress = (nurse: NurseCardData) => {
    router.push({
      pathname: "/(protected)/nurse-chat-detail",
      params: {
        nurseId: nurse.id,
        nurseName: nurse.name,
        nurseImage: nurse.image || "",
      },
    });
  };

  const handleViewProfile = (nurse: NurseCardData) => {
    router.push({
      pathname: "/(protected)/nurse-profile",
      params: {
        id: nurse.id,
        name: nurse.name,
        specialization: nurse.specialization,
        image: nurse.image || "",
        experience: nurse.experience,
        availability: nurse.availability,
        hourlyRate: nurse.hourlyRate,
        city: nurse.city,
        certifications: nurse.certifications,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading nurses...</Text>
      </SafeAreaView>
    );
  }

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
          value={stats.total}
          label="Total Nurses"
          color={colors.primary}
        />
        <StatCard
          icon="checkmark-circle"
          value={stats.available}
          label="Available Now"
          color={colors.success}
        />
        <StatCard
          icon="star"
          value={stats.total > 0 ? "4.8" : "0"}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {filteredNurses.length > 0 ? (
          filteredNurses.map((nurse) => (
            <NurseCard
              key={nurse.id}
              id={nurse.id}
              name={nurse.name}
              specialization={nurse.specialization}
              image={nurse.image || ""}
              experience={nurse.experience}
              availability={nurse.availability}
              hourlyRate={nurse.hourlyRate}
              onPress={() => handleViewProfile(nurse)}
              onChatPress={() => handleChatPress(nurse)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>No Nurses Found</Text>
            <Text style={styles.emptyText}>
              {nurses.length === 0 
                ? "No nurses are registered yet" 
                : "Try adjusting your search or filters"}
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
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
