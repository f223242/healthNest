import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButton {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isPrimary?: boolean;
}

interface CardFooterProps {
  price?: string;
  priceLabel?: string;
  actions: ActionButton[];
}

const CardFooter: React.FC<CardFooterProps> = ({
  price,
  priceLabel = "Total:",
  actions,
}) => {
  return (
    <View style={styles.cardFooter}>
      {price && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{priceLabel}</Text>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      )}
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              action.isPrimary && styles.primaryButton,
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
                action.isPrimary && styles.primaryText,
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
    </View>
  );
};

export default CardFooter;

const styles = StyleSheet.create({
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
});
