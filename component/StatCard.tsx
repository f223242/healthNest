import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  return (
    <View style={styles.container}>
      {icon ? (
        <>
          <Text style={styles.value}>{value}</Text>
          <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </>
      ) : (
        <>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </>
      )}
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary + "09",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  value: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#666",
    textAlign: "center",
  },
});
