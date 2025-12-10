import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  accentColor?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onPress,
  icon,
  containerStyle,
  accentColor,
}) => {
  const chipColor = accentColor || colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: chipColor },
        isActive && { backgroundColor: chipColor, borderColor: chipColor },
        containerStyle
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? colors.white : chipColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.chipText, { color: chipColor }, isActive && styles.chipTextActive]}>
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
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    marginRight: 10,
    height: 40,
  },
  icon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    textAlign: "center",
  },
  chipTextActive: {
    color: colors.white,
  },
});

