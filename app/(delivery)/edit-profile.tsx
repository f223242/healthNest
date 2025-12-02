import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Coming Soon</Text>
          <Text style={styles.description}>
            Profile editing feature is under development. You'll be able to update your personal details, profile picture, and contact information here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingTop: 30,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
});
