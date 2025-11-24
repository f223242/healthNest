import { SearchIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FilterChip from "@/component/FilterChip";
import FormInput from "@/component/FormInput";
import LabCard from "@/component/LabCard";
import StatCard from "@/component/StatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "All" | "Nearby" | "Rated" | "Popular";

const labsData = [
  {
    id: 1,
    name: "LabCorp",
    description: "Comprehensive lab testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.5,
    reviews: 120,
    distance: "2.3 km",
    openTime: "8:00 AM - 8:00 PM",
    testsAvailable: 250,
    accredited: true,
    homeCollection: true,
  },
  {
    id: 2,
    name: "Quest Diagnostics",
    description: "Advanced diagnostic testing services",
    image: require("@/assets/png/quest.png"),
    rating: 4.2,
    reviews: 98,
    distance: "3.5 km",
    openTime: "7:00 AM - 6:00 PM",
    testsAvailable: 180,
    accredited: true,
    homeCollection: false,
  },
  {
    id: 3,
    name: "BioReference Laboratories",
    description: "Comprehensive diagnostic testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.0,
    reviews: 75,
    distance: "5.1 km",
    openTime: "9:00 AM - 5:00 PM",
    testsAvailable: 150,
    accredited: false,
    homeCollection: true,
  },
  {
    id: 4,
    name: "Mayo Clinic Laboratories",
    description: "Leading provider of clinical laboratory services",
    image: require("@/assets/png/quest.png"),
    rating: 4.7,
    reviews: 150,
    distance: "1.8 km",
    openTime: "6:00 AM - 9:00 PM",
    testsAvailable: 320,
    accredited: true,
    homeCollection: true,
  },
  {
    id: 5,
    name: "Cleveland Clinic Labs",
    description: "Trusted laboratory testing and diagnostics",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.6,
    reviews: 88,
    distance: "4.2 km",
    openTime: "8:00 AM - 7:00 PM",
    testsAvailable: 200,
    accredited: true,
    homeCollection: false,
  },
  {
    id: 6,
    name: "Johns Hopkins Labs",
    description: "Expert diagnostic laboratory services",
    image: require("@/assets/png/quest.png"),
    rating: 4.8,
    reviews: 200,
    distance: "2.9 km",
    openTime: "24 Hours",
    testsAvailable: 280,
    accredited: true,
    homeCollection: true,
  },
];

const SelectLabs = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  const filterOptions: Array<{ label: FilterType; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "All", icon: "grid" },
    { label: "Nearby", icon: "location" },
    { label: "Rated", icon: "star" },
    { label: "Popular", icon: "trending-up" },
  ];

  const filteredLabs = labsData
    .filter((lab) => lab.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((lab) => {
      if (selectedFilter === "Nearby") return parseFloat(lab.distance) < 3;
      if (selectedFilter === "Rated") return lab.rating >= 4.5;
      if (selectedFilter === "Popular") return lab.reviews > 100;
      return true;
    })
    .sort((a, b) => {
      if (selectedFilter === "Nearby") return parseFloat(a.distance) - parseFloat(b.distance);
      if (selectedFilter === "Rated") return b.rating - a.rating;
      if (selectedFilter === "Popular") return b.reviews - a.reviews;
      return 0;
    });

  const handleContinue = () => {
    const lab = labsData.find((l) => l.id === selectedLab);
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
          value={labsData.length}
          label="Labs"
          color={colors.primary}
        />
        <StatCard
          icon="checkmark-circle"
          value={labsData.filter((l) => l.accredited).length}
          label="Accredited"
          color={colors.success}
        />
        <StatCard
          icon="home"
          value={labsData.filter((l) => l.homeCollection).length}
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
        >
          <View style={styles.labsGrid}>
            {filteredLabs.map((lab) => (
              <LabCard
                key={lab.id}
                name={lab.name}
                description={lab.description}
                image={lab.image}
                rating={lab.rating}
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
