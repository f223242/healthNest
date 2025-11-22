import { appStyles, colors, Fonts } from "@/constant/theme";
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
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={appStyles.cardTitle}>{name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
            </View>
            <Text style={appStyles.caption}>
              {totalDeliveries}+ deliveries
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isAvailable ? colors.success : colors.gray },
          ]}
        >
          <Text style={appStyles.badge}>
            {isAvailable ? "Available" : "Busy"}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={appStyles.caption}>Delivery Time</Text>
          <Text style={appStyles.body1}>{deliveryTime}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={appStyles.caption}>Distance</Text>
          <Text style={appStyles.body1}>{distance}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.chatButton} onPress={onPress}>
        <Text style={styles.chatButtonText}>💬 Start Chat</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default DeliveryPersonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  ratingContainer: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailItem: {
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderGray,
  },
  chatButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
