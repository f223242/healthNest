import { SearchIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { colors, Fonts, sizes } from "@/constant/theme";
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

const labsData = [
  {
    id: 1,
    name: "LabCorp",
    description: "Comprehensive lab testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 2,
    name: "Quest Diagnostics",
    description: "Advanced diagnostic testing services",
    image: require("@/assets/png/quest.png"),
    rating: 4.2,
    reviews: 98,
  },
  {
    id: 3,
    name: "BioReference Laboratories",
    description: "Comprehensive diagnostic testing services",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.0,
    reviews: 75,
  },
  {
    id: 4,
    name: "Mayo Clinic Laboratories",
    description: "Leading provider of clinical laboratory services",
    image: require("@/assets/png/quest.png"),
    rating: 4.7,
    reviews: 150,
  },
  {
    id: 5,
    name: "Cleveland Clinic Labs",
    description: "Trusted laboratory testing and diagnostics",
    image: require("@/assets/png/labcorp.png"),
    rating: 4.6,
    reviews: 88,
  },
  {
    id: 6,
    name: "Johns Hopkins Labs",
    description: "Expert diagnostic laboratory services",
    image: require("@/assets/png/quest.png"),
    rating: 4.8,
    reviews: 200,
  },
];

const SelectLabs = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState<number | null>(null);

  const filteredLabs = labsData.filter((lab) =>
    lab.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    // Navigate to next screen
    console.log("Selected Lab:", selectedLab);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>


      {/* Content */}
      <View style={styles.content}>
        {/* Search Input */}
        <FormInput
          LeftIcon={SearchIcon}
          placeholder="Search for labs"
          containerStyle={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Labs Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.labsGrid}>
            {filteredLabs.map((lab) => (
              <TouchableOpacity
                key={lab.id}
                activeOpacity={0.8}
                onPress={() => setSelectedLab(lab.id)}
                style={styles.labCardContainer}
              >
                <View
                  style={[
                    styles.labCard,
                    selectedLab === lab.id && styles.selectedLabCard,
                  ]}
                >
                  {/* Lab Image */}
                  <Image
                    source={lab.image}
                    style={styles.labImage}
                    resizeMode="cover"
                  />

                  {/* Lab Info */}
                  <View style={styles.labInfo}>
                    <Text style={styles.labName} numberOfLines={1}>
                      {lab.name}
                    </Text>
                    <Text style={styles.labDescription} numberOfLines={2}>
                      {lab.description}
                    </Text>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                      <Text style={styles.rating}>⭐ {lab.rating}</Text>
                      <Text style={styles.reviews}>
                        ({lab.reviews}+ reviews)
                      </Text>
                    </View>
                  </View>

                  {/* Selected Badge */}
                  {selectedLab === lab.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  labsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  labCardContainer: {
    width: "48%",
    marginBottom: 16,
  },
  labCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedLabCard: {
    borderColor: colors.primary,
    backgroundColor: "#E8F5F0",
  },
  labImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  labInfo: {
    gap: 4,
  },
  labName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  labDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#666",
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  rating: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    marginRight: 6,
  },
  reviews: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#666",
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
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
