import { colors, Fonts } from "@/constant/theme";
import FeedbackComplaintService, { Feedback } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ProviderReviewsProps {
  providerId: string;
  providerName: string;
  providerType: "nurse" | "lab" | "delivery";
  showWriteReviewButton?: boolean;
  maxReviews?: number;
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recentReviews: Feedback[];
  categoryRatings: {
    punctuality: number;
    professionalism: number;
    communication: number;
    cleanliness: number;
    valueForMoney: number;
  };
  recommendationRate: number;
}

const ProviderReviews: React.FC<ProviderReviewsProps> = ({
  providerId,
  providerName,
  providerType,
  showWriteReviewButton = true,
  maxReviews = 3,
}) => {
  const router = useRouter();
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [providerId]);

  const loadStats = async () => {
    try {
      const ratingStats = await FeedbackComplaintService.getProviderRatingStats(providerId);
      setStats(ratingStats);
    } catch (error) {
      console.error("Error loading rating stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    router.push({
      pathname: "/(protected)/feedback",
      params: {
        type: providerType,
        targetId: providerId,
        targetName: providerName,
      },
    });
  };

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : i - 0.5 <= rating ? "star-half" : "star-outline"}
          size={size}
          color="#FFB800"
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const renderRatingBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={styles.ratingBarContainer}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
        </View>
        <View style={styles.noReviewsContainer}>
          <Ionicons name="chatbubbles-outline" size={40} color={colors.gray} />
          <Text style={styles.noReviewsText}>No reviews yet</Text>
          <Text style={styles.noReviewsSubtext}>Be the first to leave a review!</Text>
          {showWriteReviewButton && (
            <TouchableOpacity style={styles.writeReviewBtn} onPress={handleWriteReview}>
              <Ionicons name="create-outline" size={18} color={colors.white} />
              <Text style={styles.writeReviewBtnText}>Write a Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
        {showWriteReviewButton && (
          <TouchableOpacity style={styles.writeReviewSmallBtn} onPress={handleWriteReview}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.writeReviewSmallText}>Write Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewLeft}>
          <Text style={styles.bigRating}>{stats.averageRating.toFixed(1)}</Text>
          {renderStars(stats.averageRating, 20)}
          <Text style={styles.totalReviews}>{stats.totalReviews} reviews</Text>
        </View>
        <View style={styles.overviewRight}>
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} style={styles.ratingRow}>
              <Text style={styles.ratingNumber}>{star}</Text>
              <Ionicons name="star" size={12} color="#FFB800" />
              {renderRatingBar(stats.ratingDistribution[star] || 0, stats.totalReviews)}
              <Text style={styles.ratingCount}>{stats.ratingDistribution[star] || 0}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendation Rate */}
      <View style={styles.recommendationCard}>
        <Ionicons name="thumbs-up" size={20} color={colors.success} />
        <Text style={styles.recommendationText}>
          <Text style={styles.recommendationPercent}>{stats.recommendationRate}%</Text> would recommend
        </Text>
      </View>

      {/* Category Ratings */}
      <View style={styles.categoryContainer}>
        {Object.entries(stats.categoryRatings)
          .filter(([_, value]) => value > 0)
          .map(([key, value]) => (
            <View key={key} style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <View style={styles.categoryRating}>
                {renderStars(value, 14)}
                <Text style={styles.categoryValue}>{value.toFixed(1)}</Text>
              </View>
            </View>
          ))}
      </View>

      {/* Recent Reviews */}
      <Text style={styles.recentTitle}>Recent Reviews</Text>
      {stats.recentReviews.slice(0, maxReviews).map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>
                  {review.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
            </View>
            {renderStars(review.rating.overall, 14)}
          </View>
          {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
          <Text style={styles.reviewComment}>{review.comment}</Text>
          {review.providerResponse && (
            <View style={styles.responseCard}>
              <Text style={styles.responseLabel}>Response:</Text>
              <Text style={styles.responseText}>{review.providerResponse}</Text>
            </View>
          )}
        </View>
      ))}

      {stats.recentReviews.length > maxReviews && (
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All {stats.totalReviews} Reviews</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  writeReviewSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
  },
  writeReviewSmallText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noReviewsText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginTop: 12,
  },
  noReviewsSubtext: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 16,
  },
  writeReviewBtnText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  overviewCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  overviewLeft: {
    alignItems: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  bigRating: {
    fontSize: 40,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  totalReviews: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  overviewRight: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingNumber: {
    width: 12,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
    textAlign: "center",
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 3,
  },
  ratingCount: {
    width: 24,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "right",
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.success + "15",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  recommendationPercent: {
    fontFamily: Fonts.bold,
    color: colors.success,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  categoryRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInitial: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  reviewTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 20,
  },
  responseCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  responseLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 18,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
});

export default ProviderReviews;
