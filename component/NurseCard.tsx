import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NurseCardProps {
  id?: string;
  name: string;
  specialization: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  experience?: string;
  availability?: "Available" | "Busy" | "Offline";
  serviceType?: string[];
  hourlyRate?: string;
  onPress?: () => void;
  onChatPress?: () => void;
  // Optional appointment-specific props
  statusBadge?: {
    label: string;
    color: string;
  };
  details?: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    color?: string;
  }>;
  location?: string;
  price?: string;
  actions?: Array<{
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    isPrimary?: boolean;
  }>;
}

const NurseCard: React.FC<NurseCardProps> = ({
  name,
  specialization,
  image,
  rating,
  reviewCount,
  experience,
  availability,
  serviceType,
  hourlyRate,
  onPress,
  onChatPress,
  statusBadge,
  details,
  location,
  price,
  actions,
}) => {
  const getAvailabilityColor = () => {
    switch (availability) {
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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Ionicons name="person" size={32} color={colors.gray} />
              </View>
            )}
            {availability && (
              <View
                style={[
                  styles.availabilityDot,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              />
            )}
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {statusBadge && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusBadge.color + "20" },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusBadge.color }]}
                  >
                    {statusBadge.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.specialization} numberOfLines={1}>
              {specialization}
            </Text>
            {rating !== undefined && reviewCount !== undefined && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.rating}>{rating}</Text>
                <Text style={styles.reviews}>({reviewCount} reviews)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details (for appointments) or Experience & Rate (for nurses) */}
        {details ? (
          <View style={styles.infoRow}>
            {details.map((detail, index) => (
              <View key={index} style={styles.infoItem}>
                <Ionicons
                  name={detail.icon}
                  size={14}
                  color={detail.color || colors.primary}
                />
                <Text style={styles.detailText}>{detail.text}</Text>
              </View>
            ))}
          </View>
        ) : experience && hourlyRate ? (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase" size={16} color={colors.primary} />
              <Text style={styles.infoText}>{experience}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash" size={16} color={colors.primary} />
              <Text style={styles.infoText}>{hourlyRate}/hr</Text>
            </View>
          </View>
        ) : null}

        {/* Service Types */}
        {serviceType && serviceType.length > 0 && (
          <View style={styles.serviceTypesContainer}>
            {serviceType.slice(0, 3).map((type, index) => (
              <View key={index} style={styles.serviceTypeBadge}>
                <Text style={styles.serviceTypeText}>{type}</Text>
              </View>
            ))}
            {serviceType.length > 3 && (
              <View style={styles.serviceTypeBadge}>
                <Text style={styles.serviceTypeText}>+{serviceType.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Location (for appointments) */}
        {location && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.gray} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}

        {/* Availability Status */}
        {availability && (
          <View style={styles.availabilityContainer}>
            <View
              style={[
                styles.availabilityBadge,
                { backgroundColor: getAvailabilityColor() + "20" },
              ]}
            >
              <View
                style={[
                  styles.availabilityDotSmall,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              />
              <Text
                style={[styles.availabilityText, { color: getAvailabilityColor() }]}
              >
                {availability}
              </Text>
            </View>
          </View>
        )}

        {/* Footer with Price and Actions */}
        {(price || actions) && (
          <View style={styles.cardFooter}>
            {price && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total:</Text>
                <Text style={styles.priceText}>{price}</Text>
              </View>
            )}
            {actions ? (
              <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      action.isPrimary && styles.primaryActionButton,
                    ]}
                    onPress={action.onPress}
                    activeOpacity={0.7}
                  >
                    {action.icon && !action.isPrimary && (
                      <Ionicons name={action.icon} size={16} color={colors.primary} />
                    )}
                    <Text
                      style={[
                        styles.actionText,
                        action.isPrimary && styles.primaryActionText,
                      ]}
                    >
                      {action.label}
                    </Text>
                    {action.icon && action.isPrimary && (
                      <Ionicons name={action.icon} size={16} color={colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {/* Default Action Buttons (for nurse cards) */}
        {!actions && (onPress || onChatPress) && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={onChatPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chatButtonGradient}
              >
                <Ionicons name="chatbubbles" size={18} color={colors.white} />
                <Text style={styles.chatButtonText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default NurseCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightGray,
    borderWidth: 3,
    borderColor: colors.white,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  availabilityDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  specialization: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginLeft: 4,
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  serviceTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  serviceTypeBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  availabilityContainer: {
    marginBottom: 12,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  availabilityDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  viewProfileButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  viewProfileText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  chatButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
  },
  chatButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  detailText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  priceContainer: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  priceText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryActionText: {
    color: colors.white,
  },
});
