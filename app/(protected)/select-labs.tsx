import { SearchIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import LabCard from "@/component/LabCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "All" | "Home Sampling" | "Rated" | "Popular";

// Lab data structure for cards
interface LabCardData {
  id: string;
  name: string;
  description: string;
  image: any;
  rating: number;
  reviews: number;
  distance: string;
  openTime: string;
  testsAvailable: number;
  accredited: boolean;
  homeCollection: boolean;
  city: string;
  servicesOffered: string;
}

const SelectLabs = () => {
  const router = useRouter();
  const { getAllUsers } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [labs, setLabs] = useState<LabCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions: Array<{ label: FilterType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Home Sampling", icon: "home" },
    { label: "Rated", icon: "star" },
    { label: "Popular", icon: "trending-up" },
  ];

  // Fetch labs from Firebase
  const fetchLabs = useCallback(async () => {
    try {
      const users = await getAllUsers("Lab");
      const labsData: LabCardData[] = users
        .filter((user: User) => user.profileCompleted && user.additionalInfo)
        .map((user: User) => {
          const info = user.additionalInfo as LabInfo;
          const labName = info.labName || `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Lab";
          
          return {
            id: user.uid,
            name: labName,
            description: info.servicesOffered || "Comprehensive lab testing services",
            image: info.profileImage ? { uri: info.profileImage } : require("@/assets/png/labcorp.png"),
            rating: 4.0 + Math.random() * 0.9, // Random rating 4.0-4.9
            reviews: Math.floor(Math.random() * 150) + 50, // Random reviews
            distance: info.city || "N/A",
            openTime: info.operatingHours || "8:00 AM - 8:00 PM",
            testsAvailable: Math.floor(Math.random() * 200) + 100,
            accredited: !!info.licenseNumber,
            homeCollection: info.homeSampling || false,
            city: info.city || "",
            servicesOffered: info.servicesOffered || "",
          };
        });
      
      setLabs(labsData);
    } catch (error) {
      console.error("Error fetching labs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLabs();
  }, [fetchLabs]);

  // Filter labs
  const filteredLabs = useMemo(() => {
    return labs
      .filter((lab) => 
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((lab) => {
        if (selectedFilter === "Home Sampling") return lab.homeCollection;
        if (selectedFilter === "Rated") return lab.rating >= 4.5;
        if (selectedFilter === "Popular") return lab.reviews > 100;
        return true;
      })
      .sort((a, b) => {
        if (selectedFilter === "Rated") return b.rating - a.rating;
        if (selectedFilter === "Popular") return b.reviews - a.reviews;
        return 0;
      });
  }, [labs, searchQuery, selectedFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = labs.length;
    const accredited = labs.filter((l) => l.accredited).length;
    const homeService = labs.filter((l) => l.homeCollection).length;
    return { total, accredited, homeService };
  }, [labs]);

  const handleContinue = () => {
    const lab = labs.find((l) => l.id === selectedLab);
    if (lab) {
      router.push({
        pathname: "/(protected)/lab-services",
        params: {
          labId: lab.id,
          labName: lab.name,
          labImage: JSON.stringify(lab.image),
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading labs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
         <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search for labs..."
          containerStyle={{...styles.searchInput}}
          value={searchQuery}
          onChangeText={setSearchQuery}
         
        />
       
      {/* Header Stats */}
      <View style={styles.headerStats}>
        

        <StatCard
          icon="flask"
          value={stats.total}
          label="Labs"
          color={colors.primary}
        />
        <StatCard
          icon="checkmark-circle"
          value={stats.accredited}
          label="Accredited"
          color={colors.success}
        />
        <StatCard
          icon="home"
          value={stats.homeService}
          label="Home Service"
          color="#FF9800"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Search Input */}
      

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
              containerStyle={{ paddingVertical: 6 }}
            />
          ))}
        </ScrollView>
      

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredLabs.length} {filteredLabs.length === 1 ? "Lab" : "Labs"} Found
          </Text>
          {selectedLab && (
            <View style={styles.selectedBadgeSmall}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.selectedText}>1 Selected</Text>
            </View>
          )}
        </View>

        {/* Labs Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {filteredLabs.length > 0 ? (
            <View style={styles.labsGrid}>
              {filteredLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  name={lab.name}
                  description={lab.description}
                  image={lab.image}
                  rating={parseFloat(lab.rating.toFixed(1))}
                  review={`${lab.reviews}+`}
                  distance={lab.distance}
                  openTime={lab.openTime}
                  testsAvailable={lab.testsAvailable}
                  accredited={lab.accredited}
                  homeCollection={lab.homeCollection}
                  isSelected={selectedLab === lab.id}
                  onPress={() => setSelectedLab(lab.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flask" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No Labs Found</Text>
              <Text style={styles.emptyText}>
                {labs.length === 0 
                  ? "No labs are registered yet" 
                  : "Try adjusting your search or filters"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Continue Button */}
      <View style={styles.bottomContainer}>
        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedLab}
          containerStyle={!selectedLab ? styles.disabledButton : undefined}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectLabs;

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
  header: {
    flexDirection: "row",
    alignItems: "center",
   
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerStats: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  content: {
    flex: 1,
    
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    paddingVertical: 8,
    gap: 8,
    marginBottom: 30,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    // paddingHorizontal: sizes.paddingHorizontal,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  selectedBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  labsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  },
  bottomContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  continueButton: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
