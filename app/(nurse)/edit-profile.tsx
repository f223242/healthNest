import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "@/constant/theme";

const EditProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      {/* Add form fields for nurse profile editing here */}
      <View style={styles.formPlaceholder}>
        <Text style={styles.placeholderText}>Profile edit form coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

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
  formPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: Fonts.regular,
  },
});
