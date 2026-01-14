import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: string | ReactNode| keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  onPress: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  backgroundColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {typeof icon === "string" ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

export default ServiceCard;

const styles = StyleSheet.create({
  container: {
    width: (sizes.width - sizes.paddingHorizontal * 2 - 12) / 2,
    height: 180,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
