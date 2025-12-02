import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface RecordActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  iconColor?: string;
  labelColor?: string;
  iconSize?: number;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

const RecordActionButton: React.FC<RecordActionButtonProps> = ({
  icon,
  label,
  onPress,
  iconColor = colors.primary,
  labelColor = colors.primary,
  iconSize = 18,
  containerStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Ionicons 
        name={icon} 
        size={iconSize} 
        color={disabled ? colors.gray : iconColor} 
      />
      <Text style={[
        styles.label, 
        { color: disabled ? colors.gray : labelColor }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default RecordActionButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
});
