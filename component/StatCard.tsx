import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  value: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
  },
});
