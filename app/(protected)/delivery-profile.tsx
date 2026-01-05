import AppButton from "@/component/AppButton";
import FeaturesGrid, { FeatureItem } from "@/component/FeaturesGrid";
import ProviderReviews from "@/component/ProviderReviews";
import StatsRow from "@/component/StatsRow";
import { useToast } from "@/component/Toast/ToastProvider";
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

const DeliveryProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Dynamic rating state
  const [ratingStats, setRatingStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dynamic ratings
  const loadRatingStats = useCallback(async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const stats = await FeedbackComplaintService.getProviderRatingStats(params.id as string);
      setRatingStats(stats);
    } catch (error) {
      console.error("Error loading delivery rating:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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

  // Parse the delivery person data from params
  const delivery = {
    id: params.id as string || "",
    name: params.name as string || "Delivery Person",
    avatar: params.avatar as string || "",
    totalDeliveries: parseInt(params.totalDeliveries as string) || 0,
    isAvailable: params.isAvailable === "true",
    deliveryTime: params.deliveryTime as string || "30 mins",
    distance: params.distance as string || "N/A",
    phone: params.phone as string || "",
    vehicleType: params.vehicleType as string || "Motorcycle",
  };

  // Dynamic features based on delivery person
  const deliveryFeatures: FeatureItem[] = [
    { icon: "medkit", label: "Medicine Delivery", iconColor: colors.primary },
    { icon: "flash", label: "Fast Service", iconColor: "#FF9800" },
    { icon: "shield-checkmark", label: "Safe Handling", iconColor: colors.success },
    { icon: "location", label: "Live Tracking", iconColor: "#9C27B0" },
  ];

  const getAvailabilityColor = () => {
    return delivery.isAvailable ? colors.success : colors.gray;
  };

  const handleChat = () => {
    router.push({
      pathname: "/(protected)/delivery-chat-detail",
      params: {
        deliveryId: delivery.id,
        deliveryName: delivery.name,
        deliveryAvatar: delivery.avatar,
      },
    });
  };

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
          <Text style={styles.headerTitle}>Delivery Profile</Text>
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
            {/* Profile Header Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {delivery.avatar ? (
                  <Image
                    source={{ uri: delivery.avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={48} color={colors.gray} />
                  </View>
                )}
                <View
                  style={[
                    styles.availabilityDot,
                    { backgroundColor: getAvailabilityColor() },
                  ]}
                />
              </View>

              <Text style={styles.name}>{delivery.name}</Text>
              
              <View style={styles.availabilityBadge}>
                <View
                  style={[
                    styles.availabilityDotSmall,
                    { backgroundColor: getAvailabilityColor() },
                  ]}
                />
                <Text
                  style={[
                    styles.availabilityText,
                    { color: getAvailabilityColor() },
                  ]}
                >
                  {delivery.isAvailable ? "Available" : "Busy"}
                </Text>
              </View>

              {/* Stats Row - Dynamic */}
              <StatsRow
                stats={[
                  { 
                    type: "number",
                    value: loading ? "..." : (ratingStats?.averageRating?.toFixed(1) || "New"), 
                    label: "Rating"
                  },
                  { 
                    type: "number",
                    value: `${delivery.totalDeliveries}+`, 
                    label: "Deliveries"
                  },
                  { 
                    type: "number",
                    value: delivery.deliveryTime, 
                    label: "Avg. Time"
                  },
                ]}
              />
            </View>

            {/* Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Information</Text>
              
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{delivery.distance} away</Text>
                </View>
              </View>

              {delivery.vehicleType && (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: "#9C27B0" + "15" }]}>
                    <Ionicons name="car" size={20} color="#9C27B0" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Vehicle</Text>
                    <Text style={styles.infoValue}>{delivery.vehicleType}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.success + "15" }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Verified</Text>
                  <Text style={styles.infoValue}>Identity Verified</Text>
                </View>
              </View>
            </View>

            {/* Features - Using reusable component */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <FeaturesGrid features={deliveryFeatures} />
            </View>

            {/* Reviews Section */}
            <ProviderReviews
              providerId={delivery.id}
              providerType="delivery"
              providerName={delivery.name}
            />

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <AppButton
            title={delivery.isAvailable ? "Start Chat" : "Currently Unavailable"}
            onPress={handleChat}
            containerStyle={styles.chatButton}
            disabled={!delivery.isAvailable}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default DeliveryProfile;

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
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  availabilityDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
  },
  name: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 8,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  availabilityDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
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
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginTop: 2,
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
  chatButton: {
    flex: 1,
  },
});
