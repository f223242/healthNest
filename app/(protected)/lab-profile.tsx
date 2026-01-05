import AppButton from "@/component/AppButton";
import FeaturesGrid, { FeatureItem } from "@/component/FeaturesGrid";
import ProviderReviews from "@/component/ProviderReviews";
import StatsRow, { StatItem } from "@/component/StatsRow";
import { colors, Fonts, sizes } from "@/constant/theme";
import FeedbackComplaintService from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ratingStats, setRatingStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Parse the lab data from params
  const lab = {
    id: params.id as string || "",
    name: params.name as string || "Lab",
    description: params.description as string || "Comprehensive lab testing services",
    image: params.image as string || "",
    distance: params.distance as string || "N/A",
    openTime: params.openTime as string || "8:00 AM - 8:00 PM",
    testsAvailable: parseInt(params.testsAvailable as string) || 100,
    accredited: params.accredited === "true",
    homeCollection: params.homeCollection === "true",
    city: params.city as string || "",
    servicesOffered: params.servicesOffered as string || "",
  };

  // Dynamic lab features
  const labFeatures: FeatureItem[] = [
    { icon: "flask", iconColor: colors.primary, label: "Full Lab Tests" },
    ...(lab.homeCollection ? [{ icon: "home" as keyof typeof Ionicons.glyphMap, iconColor: "#FF9800", label: "Home Collection" }] : []),
    ...(lab.accredited ? [{ icon: "shield-checkmark" as keyof typeof Ionicons.glyphMap, iconColor: colors.success, label: "Accredited Lab" }] : []),
    { icon: "document-text", iconColor: "#9C27B0", label: "Digital Reports" },
  ];

  // Fetch real rating stats
  const loadRatingStats = useCallback(async () => {
    if (!lab.id) return;
    try {
      setLoading(true);
      const stats = await FeedbackComplaintService.getProviderRatingStats(lab.id);
      setRatingStats({
        avgRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });
    } catch (error) {
      console.error("Error loading rating stats:", error);
    } finally {
      setLoading(false);
    }
  }, [lab.id]);

  useFocusEffect(
    useCallback(() => {
      loadRatingStats();
      // Run animations
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
    }, [loadRatingStats])
  );

  const handleBookTest = () => {
    router.push({
      pathname: "/(protected)/lab-services",
      params: {
        labId: lab.id,
        labName: lab.name,
        labImage: lab.image,
      },
    });
  };

  // Build stats for StatsRow component
  const statsData: StatItem[] = [
    { type: "number", value: `${lab.testsAvailable}+`, label: "Tests Available" },
    { type: "number", value: ratingStats.totalReviews > 0 ? `${ratingStats.avgRating.toFixed(1)} ⭐` : "New", label: ratingStats.totalReviews > 0 ? `${ratingStats.totalReviews} Reviews` : "No Reviews Yet" },
  ];

  if (lab.homeCollection) {
    statsData.push({ type: "icon", icon: "home", iconColor: colors.primary, label: "Home Sampling" });
  }

  // Build features for FeaturesGrid component
  const featuresData: FeatureItem[] = [
    { icon: "flask", iconColor: colors.primary, label: "Full Lab Tests", visible: true },
    { icon: "home", iconColor: "#FF9800", label: "Home Collection", visible: lab.homeCollection },
    { icon: "shield-checkmark", iconColor: colors.success, label: "Accredited Lab", visible: lab.accredited },
    { icon: "document-text", iconColor: "#9C27B0", label: "Digital Reports", visible: true },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"]}
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
          <Text style={styles.headerTitle}>Lab Profile</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Lab Header Card */}
            <View style={styles.labCard}>
              <View style={styles.labImageContainer}>
                {lab.image ? (
                  <Image
                    source={{ uri: lab.image }}
                    style={styles.labImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.labImage, styles.labImagePlaceholder]}>
                    <Ionicons name="flask" size={48} color={colors.gray} />
                  </View>
                )}
                {lab.accredited && (
                  <View style={styles.accreditedBadge}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.white} />
                    <Text style={styles.accreditedText}>Accredited</Text>
                  </View>
                )}
              </View>

              <Text style={styles.labName}>{lab.name}</Text>
              <Text style={styles.labDescription}>{lab.description}</Text>

              {/* Quick Info with Dynamic Rating */}
              <View style={styles.quickInfoRow}>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.quickInfoText}>
                    {loading ? "..." : (ratingStats?.avgRating?.toFixed(1) || "New")}
                  </Text>
                </View>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                  <Text style={styles.quickInfoText}>{lab.city || lab.distance}</Text>
                </View>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="time" size={18} color="#FF9800" />
                  <Text style={styles.quickInfoText}>{lab.openTime}</Text>
                </View>
              </View>

              {/* Stats Row - Dynamic */}
              <StatsRow
                stats={[
                  { type: "number", value: `${lab.testsAvailable}+`, label: "Tests Available" },
                  { type: "number", value: loading ? "..." : `${ratingStats?.totalReviews || 0}`, label: "Reviews" },
                  ...(lab.homeCollection ? [{ type: "icon" as const, icon: "home" as keyof typeof Ionicons.glyphMap, iconColor: colors.primary, label: "Home Sampling" }] : []),
                ]}
              />
            </View>

            {/* Services Section */}
            {lab.servicesOffered && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services Offered</Text>
                <View style={styles.servicesContainer}>
                  {lab.servicesOffered.split(",").map((service: string, index: number) => (
                    <View key={index} style={styles.serviceChip}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      <Text style={styles.serviceText}>{service.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Features - Dynamic */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <FeaturesGrid features={labFeatures} />
            </View>

            {/* Reviews Section */}
            <ProviderReviews
              providerId={lab.id}
              providerType="lab"
              providerName={lab.name}
            />

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <AppButton
            title="Book Test"
            onPress={handleBookTest}
            containerStyle={styles.bookButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LabProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
  },
  labCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  labImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  labImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  labImagePlaceholder: {
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  accreditedBadge: {
    position: "absolute",
    bottom: -10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accreditedText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  labName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.black,
    textAlign: "center",
    marginBottom: 4,
  },
  labDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  quickInfoRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickInfoText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderGray,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  serviceText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bookButton: {
    flex: 1,
  },
});
