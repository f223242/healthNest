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
  deliveryType?: "medicine" | "lab";
  qualification?: string;
}

interface DeliveryPersonCardProps extends DeliveryPerson {
  onPress: () => void;
  onViewProfile?: () => void;
  onBook?: () => void;
  hasActiveAppointment?: boolean;
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
  onViewProfile,
  onBook,
  hasActiveAppointment = false,
}) => {
  // Chat is only enabled if user has an active/accepted appointment with this delivery person
  const canChat = hasActiveAppointment;
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Ionicons name="person" size={28} color={colors.gray} />
              </View>
            )}
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
              <Text style={styles.reviews}>
                ({totalDeliveries}+ deliveries)
              </Text>
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
              {
                backgroundColor: isAvailable
                  ? colors.success + "20"
                  : colors.gray + "20",
              },
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

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          {/* View Profile Button */}
          {onViewProfile && (
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={onViewProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="person" size={16} color={colors.primary} />
              <Text style={styles.viewProfileText}>Profile</Text>
            </TouchableOpacity>
          )}

          {/* Book Button */}
          {onBook && (
            <TouchableOpacity
              style={[styles.bookButton, !isAvailable && styles.buttonDisabled]}
              onPress={isAvailable ? onBook : undefined}
              activeOpacity={isAvailable ? 0.7 : 1}
              disabled={!isAvailable}
            >
              <LinearGradient
                colors={
                  isAvailable
                    ? [colors.primary, "#00D68F"]
                    : [colors.gray, colors.gray]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookButtonGradient}
              >
                <Ionicons name="calendar" size={16} color={colors.white} />
                <Text style={styles.bookButtonText}>Book</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Chat Button - Locked until appointment is booked */}
          <TouchableOpacity
            style={[styles.chatButton, !canChat && styles.buttonDisabled]}
            onPress={canChat ? onPress : undefined}
            activeOpacity={canChat ? 0.7 : 1}
            disabled={!canChat}
          >
            <View
              style={[
                styles.chatButtonInner,
                !canChat && styles.chatButtonLocked,
              ]}
            >
              <Ionicons
                name={canChat ? "chatbubbles" : "lock-closed"}
                size={16}
                color={canChat ? colors.primary : colors.gray}
              />
              <Text
                style={[
                  styles.chatButtonTextOutline,
                  !canChat && styles.chatButtonTextLocked,
                ]}
              >
                {canChat ? "Chat" : "Locked"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
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
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
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
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    gap: 5,
  },
  viewProfileText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  bookButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
  },
  bookButtonText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  chatButton: {
    height: 42,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  chatButtonInner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  chatButtonLocked: {
    borderColor: colors.gray,
    backgroundColor: colors.lightGray,
  },
  chatButtonTextOutline: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  chatButtonTextLocked: {
    color: colors.gray,
  },
  chatButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
