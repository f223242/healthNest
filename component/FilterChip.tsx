import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? colors.white : colors.primary}
          style={styles.icon}
        />
      )}
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginRight: 10,
    minHeight: 40,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  chipTextActive: {
    color: colors.white,
  },
});
