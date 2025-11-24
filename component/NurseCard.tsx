import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NurseCardProps {
  id: string;
  name: string;
  specialization: string;
  image: string;
  rating: number;
  reviewCount: number;
  experience: string;
  availability: "Available" | "Busy" | "Offline";
  serviceType: string[];
  hourlyRate: string;
  onPress?: () => void;
  onChatPress?: () => void;
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
            <Image source={{ uri: image }} style={styles.image} />
            <View
              style={[
                styles.availabilityDot,
                { backgroundColor: getAvailabilityColor() },
              ]}
            />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.specialization} numberOfLines={1}>
              {specialization}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.rating}>{rating}</Text>
              <Text style={styles.reviews}>({reviewCount} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Experience & Rate */}
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

        {/* Service Types */}
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

        {/* Availability Status */}
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

        {/* Action Buttons */}
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
  name: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
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
});
