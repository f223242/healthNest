import AppButton from "@/component/AppButton";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

const NurseProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  // Parse the nurse data from params
  const nurse = {
    id: params.id as string,
    name: params.name as string,
    specialization: params.specialization as string,
    image: params.image as string,
    rating: parseFloat(params.rating as string),
    reviewCount: parseInt(params.reviewCount as string),
    experience: params.experience as string,
    availability: params.availability as string,
    serviceType: JSON.parse(params.serviceType as string),
    hourlyRate: params.hourlyRate as string,
  };

  const getAvailabilityColor = () => {
    switch (nurse.availability) {
      case "Available":
        return colors.success;
      case "Busy":
        return "#FF9800";
      case "Offline":
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const handleChatPress = () => {
    router.push({
      pathname: "/(protected)/medicine-chat",
      params: {
        personName: nurse.name,
        personAvatar: nurse.image,
        useTora: "false",
      },
    });
  };

  const handleBookNow = () => {
    // TODO: Implement booking functionality
    console.log("Book nurse:", nurse.name);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header with Image */}
          <LinearGradient
            colors={[colors.primary, "#00C853"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <View style={styles.imageWrapper}>
              <Image source={{ uri: nurse.image }} style={styles.profileImage} />
              <View
                style={[
                  styles.availabilityDot,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              />
            </View>
            <Text style={styles.headerName}>{nurse.name}</Text>
            <Text style={styles.headerSpecialization}>{nurse.specialization}</Text>

            {/* Rating */}
            <View style={styles.headerRating}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingText}>{nurse.rating}</Text>
              <Text style={styles.headerReviewText}>({nurse.reviewCount} reviews)</Text>
            </View>
          </LinearGradient>

          <Animated.View 
            style={{ 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }}
          >

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="briefcase" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{nurse.experience}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="cash" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Hourly Rate</Text>
            <Text style={styles.statValue}>{nurse.hourlyRate}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons
                name={
                  nurse.availability === "Available"
                    ? "checkmark-circle"
                    : "time"
                }
                size={24}
                color={getAvailabilityColor()}
              />
            </View>
            <Text style={styles.statLabel}>Status</Text>
            <Text
              style={[styles.statValue, { color: getAvailabilityColor() }]}
            >
              {nurse.availability}
            </Text>
          </View>
        </View>

        {/* Service Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialized In</Text>
          <View style={styles.serviceTypesGrid}>
            {nurse.serviceType.map((type: string, index: number) => (
              <View key={index} style={styles.serviceTypeCard}>
                <Ionicons
                  name={
                    type === "Elderly Care"
                      ? "accessibility"
                      : type === "Child Care"
                      ? "happy"
                      : type === "Post-Surgery"
                      ? "bandage"
                      : "medical"
                  }
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.serviceTypeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {nurse.name} is a highly experienced {nurse.specialization.toLowerCase()} with{" "}
            {nurse.experience} of professional practice. Dedicated to providing
            exceptional care and support to patients and their families.
            Specialized in multiple care areas including{" "}
            {nurse.serviceType.join(", ")}.
          </Text>
        </View>

        {/* Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          <View style={styles.qualificationItem}>
            <View style={styles.qualificationIcon}>
              <Ionicons name="school" size={20} color={colors.primary} />
            </View>
            <View style={styles.qualificationInfo}>
              <Text style={styles.qualificationTitle}>
                Bachelor of Science in Nursing (BSN)
              </Text>
              <Text style={styles.qualificationDetail}>
                State Medical University • 2012-2016
              </Text>
            </View>
          </View>

          <View style={styles.qualificationItem}>
            <View style={styles.qualificationIcon}>
              <Ionicons name="ribbon" size={20} color={colors.primary} />
            </View>
            <View style={styles.qualificationInfo}>
              <Text style={styles.qualificationTitle}>
                Registered Nurse (RN) License
              </Text>
              <Text style={styles.qualificationDetail}>
                State Board of Nursing • License #RN-12345
              </Text>
            </View>
          </View>

          <View style={styles.qualificationItem}>
            <View style={styles.qualificationIcon}>
              <Ionicons name="medal" size={20} color={colors.primary} />
            </View>
            <View style={styles.qualificationInfo}>
              <Text style={styles.qualificationTitle}>
                CPR & First Aid Certified
              </Text>
              <Text style={styles.qualificationDetail}>
                American Heart Association • Valid until 2026
              </Text>
            </View>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {[
              "Patient Care",
              "Medication Administration",
              "Vital Signs Monitoring",
              "Wound Care",
              "IV Therapy",
              "Emergency Response",
              "Patient Education",
              "Care Planning",
            ].map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Breakdown */}
          <View style={styles.ratingBreakdown}>
            <View style={styles.overallRating}>
              <Text style={styles.overallRatingNumber}>{nurse.rating}</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(nurse.rating) ? "star" : "star-outline"}
                    size={16}
                    color="#FFB800"
                  />
                ))}
              </View>
              <Text style={styles.reviewCountText}>
                Based on {nurse.reviewCount} reviews
              </Text>
            </View>

            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>{rating}★</Text>
                  <View style={styles.ratingBarBg}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        {
                          width: `${
                            rating === 5
                              ? 85
                              : rating === 4
                              ? 10
                              : rating === 3
                              ? 3
                              : 1
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingBarCount}>
                    {rating === 5
                      ? Math.floor(nurse.reviewCount * 0.85)
                      : rating === 4
                      ? Math.floor(nurse.reviewCount * 0.1)
                      : rating === 3
                      ? Math.floor(nurse.reviewCount * 0.03)
                      : 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sample Review */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image
                source={{
                  uri: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
                }}
                style={styles.reviewerImage}
              />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>John Smith</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={12} color="#FFB800" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>2 weeks ago</Text>
            </View>
            <Text style={styles.reviewText}>
              Excellent care and very professional. {nurse.name} was very
              attentive to my mother's needs and provided exceptional support
              during her recovery. Highly recommended!
            </Text>
          </View>
        </View>

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.chatIconButton}
            onPress={handleChatPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          </TouchableOpacity>

          <AppButton
            title={`Book Now • ${nurse.hourlyRate}/hr`}
            onPress={handleBookNow}
            containerStyle={styles.bookButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default NurseProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  availabilityDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.white,
  },
  headerName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },
  headerSpecialization: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  headerRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginLeft: 6,
    marginRight: 4,
  },
  headerReviewText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.9)",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: colors.white,
    marginHorizontal: sizes.paddingHorizontal,
    marginTop:  20,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: colors.borderGray,
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: sizes.paddingHorizontal,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  serviceTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceTypeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.lightGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  serviceTypeText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    textAlign: "center",
  },
  aboutText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 22,
  },
  qualificationItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  qualificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  qualificationInfo: {
    flex: 1,
  },
  qualificationTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  qualificationDetail: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  skillText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  ratingBreakdown: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  overallRating: {
    alignItems: "center",
  },
  overallRatingNumber: {
    fontSize: 48,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewCountText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
  },
  ratingBars: {
    flex: 1,
    justifyContent: "center",
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
    width: 25,
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFB800",
  },
  ratingBarCount: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    width: 30,
    textAlign: "right",
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  reviewText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    gap: 12,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bookButton: {
    flex: 1,
    height: 52,
  },
});
