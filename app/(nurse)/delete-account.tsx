import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "@/constant/theme";

const DeleteAccountScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Delete Account</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Are you sure you want to permanently delete your account? This action cannot be undone.
        </Text>
      </View>
      {/* Add confirmation and delete logic here */}
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.danger,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: colors.danger + "15",
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
