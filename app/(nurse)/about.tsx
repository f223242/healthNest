import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "@/constant/theme";

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>About App</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          HealthNest Nurse Dashboard v1.0.0\nThis app helps nurses manage their profile, support, and account settings efficiently.
        </Text>
      </View>
      {/* Add more app details and version info here */}
    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.primary,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: colors.primary + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: Fonts.regular,
  },
});
