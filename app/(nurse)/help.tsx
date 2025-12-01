import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "@/constant/theme";

const HelpScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Help & Support</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          For any assistance, please contact support or refer to the FAQ section.
        </Text>
      </View>
      {/* Add support contact and FAQ links here */}
    </SafeAreaView>
  );
};

export default HelpScreen;

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
