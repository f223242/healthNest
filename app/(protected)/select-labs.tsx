import { SearchIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import LabCard from "@/component/LabCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const filterOptions: Array<{ label: FilterType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Home Sampling", icon: "home" },
    { label: "Rated", icon: "star" },
    { label: "Popular", icon: "trending-up" },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch labs from Firebase with dynamic ratings
  const fetchLabs = useCallback(async () => {
    try {
      const users = await getAllUsers("Lab");
      const labsData: LabCardData[] = await Promise.all(
        users
          .filter((user: User) => user.profileCompleted && user.additionalInfo)
          .map(async (user: User) => {
            const info = user.additionalInfo as LabInfo;
            const labName = info.labName || `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Lab";
            
            // Fetch real ratings from Firebase
            let rating = 0;
            let reviews = 0;
            try {
              const ratingStats = await FeedbackComplaintService.getProviderRatingStats(user.uid);
              rating = ratingStats.averageRating || 0;
              reviews = ratingStats.totalReviews || 0;
            } catch (err) {
              console.log("No ratings for lab:", user.uid);
            }
            
            return {
              id: user.uid,
              name: labName,
              description: info.servicesOffered || "Comprehensive lab testing services",
              image: info.profileImage ? { uri: info.profileImage } : require("@/assets/png/labcorp.png"),
              rating,
              reviews,
              distance: info.city || "N/A",
              openTime: info.operatingHours || "8:00 AM - 8:00 PM",
              testsAvailable: 100, // Default test count
              accredited: !!info.licenseNumber,
              homeCollection: info.homeSampling || false,
              city: info.city || "",
              servicesOffered: info.servicesOffered || "",
            };
          })
      );
      
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

  const handleViewLabProfile = (lab: LabCardData) => {
    router.push({
      pathname: "/(protected)/lab-profile",
      params: {
        id: lab.id,
        name: lab.name,
        description: lab.description,
        image: typeof lab.image === "object" ? lab.image.uri : "",
        rating: lab.rating.toString(),
        reviews: lab.reviews.toString(),
        distance: lab.distance,
        openTime: lab.openTime,
        testsAvailable: lab.testsAvailable.toString(),
        accredited: lab.accredited.toString(),
        homeCollection: lab.homeCollection.toString(),
        city: lab.city,
        servicesOffered: lab.servicesOffered,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading labs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00C853"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Lab</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="flask" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Choose a lab for your tests</Text>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
          {/* Search Input */}
          <FormInput
            LeftIcon={SearchIcon}
            placeholder="Search for labs..."
            containerStyle={styles.searchInput}
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
                  onViewProfile={() => handleViewLabProfile(lab)}
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
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default SelectLabs;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    textAlign: "center",
    marginRight: 40,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
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
