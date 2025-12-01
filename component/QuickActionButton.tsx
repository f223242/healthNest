import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  iconColor?: string;
  backgroundColor?: string;
  containerStyle?: ViewStyle;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onPress,
  iconColor = colors.primary,
  backgroundColor = colors.primary + "15",
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickActionButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
});
