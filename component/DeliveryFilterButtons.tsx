import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeliveryFilterButtonsProps {
  onFilterChange: (filter: "all" | "available") => void;
  activeFilter: "all" | "available";
}

const DeliveryFilterButtons: React.FC<DeliveryFilterButtonsProps> = ({
  onFilterChange,
  activeFilter,
}) => {
  return (
    <View style={styles.container}>
      {/* Button 1: ALL */}
      <TouchableOpacity
        style={[styles.button, activeFilter === "all" && styles.buttonActive]}
        onPress={() => onFilterChange("all")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="list"
          size={12}
          color={activeFilter === "all" ? colors.white : colors.gray}
        />
        <Text
          style={[
            styles.buttonText,
            activeFilter === "all" && styles.buttonTextActive,
          ]}
          numberOfLines={1}
        >
          All
        </Text>
      </TouchableOpacity>

      {/* Button 2: AVAILABLE */}
      <TouchableOpacity
        style={[
          styles.button,
          activeFilter === "available" && styles.buttonActive,
        ]}
        onPress={() => onFilterChange("available")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="checkmark-circle"
          size={12}
          color={activeFilter === "available" ? colors.white : colors.gray}
        />
        <Text
          style={[
            styles.buttonText,
            activeFilter === "available" && styles.buttonTextActive,
          ]}
          numberOfLines={1}
        >
          Available
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeliveryFilterButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    minHeight: 32,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginLeft: 3,
  },
  buttonTextActive: {
    color: colors.white,
  },
});