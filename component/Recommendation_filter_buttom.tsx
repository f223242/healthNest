import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeliveryFilterButtonsProps {
  onFilterChange: (filter: "all" | "available" | "recommended") => void;
  activeFilter: "all" | "available" | "recommended";
}

const DeliveryFilterButtons: React.FC<DeliveryFilterButtonsProps> = ({
  onFilterChange,
  activeFilter,
}) => {
  return (
    <View style={styles.container}>
      {/* ALL Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeFilter === "all" && styles.buttonActive,
        ]}
        onPress={() => onFilterChange("all")}
      >
        <Text
          style={[
            styles.buttonText,
            activeFilter === "all" && styles.buttonTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {/* Available Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeFilter === "available" && styles.buttonActive,
        ]}
        onPress={() => onFilterChange("available")}
      >
        <Ionicons
          name="checkmark-circle"
          size={16}
          color={activeFilter === "available" ? colors.white : colors.gray}
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.buttonText,
            activeFilter === "available" && styles.buttonTextActive,
          ]}
        >
          Available
        </Text>
      </TouchableOpacity>

      {/* Recommended Button */}
      <TouchableOpacity
        style={[
          styles.button,
          activeFilter === "recommended" && styles.buttonActive,
        ]}
        onPress={() => onFilterChange("recommended")}
      >
        <Ionicons
          name="star"
          size={16}
          color={activeFilter === "recommended" ? colors.white : colors.primary}
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.buttonText,
            activeFilter === "recommended" && styles.buttonTextActive,
          ]}
        >
          Recommended
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeliveryFilterButtons;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
  },
  buttonTextActive: {
    color: colors.white,
  },
  buttonIcon: {
    marginRight: 6,
  },
});