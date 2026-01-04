import AppButton from "@/component/AppButton";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService, { FeedbackType, Rating } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FeedbackScreen = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthContext();
  const params = useLocalSearchParams<{
    type?: FeedbackType;
    targetId?: string;
    targetName?: string;
  }>();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    (params.type as FeedbackType) || "general"
  );
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<Rating>({
    overall: 0,
    punctuality: 0,
    professionalism: 0,
    communication: 0,
    valueForMoney: 0,
  });
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const feedbackTypes: { label: string; value: FeedbackType; icon: string }[] = [
    { label: "Nurse", value: "nurse", icon: "medkit-outline" },
    { label: "Lab Service", value: "lab", icon: "flask-outline" },
    { label: "Delivery", value: "delivery", icon: "bicycle-outline" },
    { label: "Appointment", value: "appointment", icon: "calendar-outline" },
    { label: "Lab Test", value: "lab_test", icon: "document-text-outline" },
    { label: "App Experience", value: "app", icon: "phone-portrait-outline" },
    { label: "General", value: "general", icon: "chatbubble-outline" },
  ];

  const ratingCategories = [
    { key: "overall", label: "Overall Experience", required: true },
    { key: "punctuality", label: "Punctuality" },
    { key: "professionalism", label: "Professionalism" },
    { key: "communication", label: "Communication" },
    { key: "valueForMoney", label: "Value for Money" },
  ];

  const renderStars = (categoryKey: keyof Rating, currentRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              setRating((prev) => ({ ...prev, [categoryKey]: star }));
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={28}
              color={star <= currentRating ? "#FFD700" : colors.gray}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (rating.overall === 0) {
      toast.error("Please provide an overall rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackComplaintService.submitFeedback(
        user.uid,
        user.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "User",
        feedbackType,
        rating,
        comment.trim(),
        {
          targetId: params.targetId,
          targetName: params.targetName,
          title: title.trim() || undefined,
          wouldRecommend: wouldRecommend ?? true,
          isPublic: true,
        }
      );

      toast.success("Thank you for your feedback!");
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, "#00C853"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Feedback</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Your feedback helps us improve our services. We appreciate your time!
              </Text>
            </View>

            {/* Feedback Type */}
            {!params.type && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Feedback Type</Text>
                <View style={styles.typesContainer}>
                  {feedbackTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeChip,
                        feedbackType === type.value && styles.typeChipActive,
                      ]}
                      onPress={() => setFeedbackType(type.value)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={18}
                        color={feedbackType === type.value ? colors.white : colors.primary}
                      />
                      <Text
                        style={[
                          styles.typeText,
                          feedbackType === type.value && styles.typeTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Target Info */}
            {params.targetName && (
              <View style={styles.targetCard}>
                <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                <View>
                  <Text style={styles.targetLabel}>Rating for</Text>
                  <Text style={styles.targetName}>{params.targetName}</Text>
                </View>
              </View>
            )}

            {/* Ratings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rate Your Experience</Text>
              <View style={styles.ratingsContainer}>
                {ratingCategories.map((category) => (
                  <View key={category.key} style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>
                      {category.label}
                      {category.required && <Text style={styles.required}>*</Text>}
                    </Text>
                    {renderStars(
                      category.key as keyof Rating,
                      rating[category.key as keyof Rating] || 0
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Title (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Give your feedback a title"
                  placeholderTextColor={colors.gray}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Your Comments <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us about your experience..."
                  placeholderTextColor={colors.gray}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>{comment.length} / 500</Text>
            </View>

            {/* Would Recommend */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Would you recommend us?</Text>
              <View style={styles.recommendContainer}>
                <TouchableOpacity
                  style={[
                    styles.recommendButton,
                    wouldRecommend === true && styles.recommendButtonActive,
                  ]}
                  onPress={() => setWouldRecommend(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="thumbs-up"
                    size={24}
                    color={wouldRecommend === true ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.recommendText,
                      wouldRecommend === true && styles.recommendTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.recommendButton,
                    wouldRecommend === false && styles.recommendButtonNo,
                  ]}
                  onPress={() => setWouldRecommend(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="thumbs-down"
                    size={24}
                    color={wouldRecommend === false ? colors.white : colors.danger}
                  />
                  <Text
                    style={[
                      styles.recommendText,
                      { color: colors.danger },
                      wouldRecommend === false && styles.recommendTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <AppButton
              title={isSubmitting ? "Submitting..." : "Submit Feedback"}
              onPress={handleSubmit}
              containerStyle={styles.submitButton}
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default FeedbackScreen;

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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  required: {
    color: colors.danger,
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  typeTextActive: {
    color: colors.white,
  },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  targetLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  targetName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  ratingsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  ratingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    paddingVertical: 14,
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    minHeight: 100,
    maxHeight: 160,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "right",
    marginTop: 4,
  },
  recommendContainer: {
    flexDirection: "row",
    gap: 16,
  },
  recommendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  recommendButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  recommendButtonNo: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  recommendText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  recommendTextActive: {
    color: colors.white,
  },
  submitButton: {
    marginTop: 8,
  },
});
