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
    padding: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1,
  },
  value: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#666",
    textAlign: "center",
  },
});
