import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LabCardProps {
  name: string;
  description: string;
  image: any;
  rating: number;
  review: string;
  onPress?: () => void;
  onViewProfile?: () => void;
  isSelected?: boolean;
  distance?: string;
  openTime?: string;
  testsAvailable?: number;
  accredited?: boolean;
  homeCollection?: boolean;
}

const LabCard: React.FC<LabCardProps> = ({
  name,
  description,
  image,
  rating,
  review,
  onPress,
  onViewProfile,
  isSelected = false,
  distance,
  openTime,
  testsAvailable,
  accredited = false,
  homeCollection = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.labItem}
      onPress={onPress}
      activeOpacity={0.8}
      onLongPress={onViewProfile}
    >
      <LinearGradient
        colors={
          isSelected
            ? [colors.primary + "15", colors.primary + "05"]
            : ["#ffffff", "#f8f9fa"]
        }
        style={[
          styles.gradientCard,
          isSelected && styles.selectedCard,
        ]}
      >
        {image ? (
          <Image source={image} style={styles.labImage} resizeMode="cover" />
        ) : (
          <View style={[styles.labImage, styles.labImagePlaceholder]}>
            <Ionicons name="flask" size={32} color={colors.gray} />
          </View>
        )}
        <View style={styles.labInfo}>
          {/* Lab Name with Accredited Badge */}
          <View style={styles.labNameRow}>
            <Text style={[appStyles.h4, styles.labName]} numberOfLines={1}>
              {name}
            </Text>
            {accredited && (
              <View style={styles.accreditedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success} />
              </View>
            )}
          </View>

          <Text style={[appStyles.body2, styles.description]} numberOfLines={2}>
            {description}
          </Text>

          {/* Distance and Open Time */}
          {(distance || openTime) && (
            <View style={styles.detailsRow}>
              {distance && (
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <Text style={styles.detailText} numberOfLines={1}>{distance}</Text>
                </View>
              )}
              {openTime && (
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={14} color="#FF9800" />
                  <Text style={styles.detailText} numberOfLines={1}>{openTime}</Text>
                </View>
              )}
            </View>
          )}

          {/* Tests Available */}
          {testsAvailable !== undefined && (
            <View style={styles.testsRow}>
              <Ionicons name="flask" size={14} color={colors.primary} />
              <Text style={styles.testsText}>
                {testsAvailable} tests available
              </Text>
            </View>
          )}

          {/* Rating and Home Collection */}
          <View style={styles.bottomRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {rating}</Text>
              <Text style={styles.review}>({review})</Text>
            </View>
            {homeCollection && (
              <View style={styles.homeCollectionBadge}>
                <Ionicons name="home" size={12} color="#FF9800" />
                <Text style={styles.homeCollectionText}>Home</Text>
              </View>
            )}
          </View>

          {/* View Profile Button */}
          {onViewProfile && (
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={onViewProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Badge */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default LabCard;

const styles = StyleSheet.create({
  labItem: {
    width: (sizes.width - sizes.paddingHorizontal * 2 - 12) / 2,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  gradientCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  labImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  labImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  labInfo: {
    gap: 6,
  },
  labNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  labName: {
    fontSize: 14,
    marginBottom: 0,
    fontWeight: "600",
    flex: 1,
    marginRight: 4,
  },
  accreditedBadge: {
    backgroundColor: colors.success + "20",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 12,
    marginTop: 0,
    marginBottom: 0,
    color: "#666",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  detailText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#666",
    flexShrink: 1,
  },
  testsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  testsText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  rating: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 6,
  },
  review: {
    fontSize: 11,
    color: "#666",
  },
  homeCollectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9800" + "15",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  homeCollectionText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#FF9800",
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
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    gap: 4,
  },
  viewProfileText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
});
