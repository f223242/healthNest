import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface DeliveryPerson {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  deliveryTime: string;
  distance: string;
}

interface DeliveryPersonCardProps extends DeliveryPerson {
  onPress: () => void;
}

const DeliveryPersonCard: React.FC<DeliveryPersonCardProps> = ({
  name,
  avatar,
  rating,
  totalDeliveries,
  isAvailable,
  deliveryTime,
  distance,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: avatar }} style={styles.image} />
            <View
              style={[
                styles.availabilityDot,
                { backgroundColor: isAvailable ? colors.success : colors.gray },
              ]}
            />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({totalDeliveries}+ deliveries)</Text>
            </View>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={styles.infoText}>{deliveryTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.infoText}>{distance} away</Text>
          </View>
        </View>

        {/* Availability Status */}
        <View style={styles.availabilityContainer}>
          <View
            style={[
              styles.availabilityBadge,
              { backgroundColor: isAvailable ? colors.success + "20" : colors.gray + "20" },
            ]}
          >
            <View
              style={[
                styles.availabilityDotSmall,
                { backgroundColor: isAvailable ? colors.success : colors.gray },
              ]}
            />
            <Text
              style={[
                styles.availabilityText,
                { color: isAvailable ? colors.success : colors.gray },
              ]}
            >
              {isAvailable ? "Available" : "Busy"}
            </Text>
          </View>
        </View>

        {/* Chat Button */}
        <TouchableOpacity style={styles.chatButton} onPress={onPress} activeOpacity={0.7}>
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatButtonGradient}
          >
            <Ionicons name="chatbubbles" size={18} color={colors.white} />
            <Text style={styles.chatButtonText}>Start Chat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default DeliveryPersonCard;

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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    borderWidth: 3,
    borderColor: colors.white,
  },
  availabilityDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
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
  chatButton: {
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
