import AppButton from "@/component/AppButton";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = () => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Ionicons name="help-circle-outline" size={60} color={colors.white} />
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            We're here to assist you anytime
          </Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Intro Text */}
        <Text style={styles.introText}>
          If you need help using the app, have issues with your account, or want
          to report a problem, explore the sections below or contact our support team.
        </Text>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqContainer}>
          <Text style={styles.faqQuestion}>• How do I reset my password?</Text>
          <Text style={styles.faqAnswer}>
            Go to Settings → Change Password. Follow instructions to create a new password.
          </Text>

          <Text style={styles.faqQuestion}>• How do I update my profile?</Text>
          <Text style={styles.faqAnswer}>
            Navigate to your Profile tab and update your details anytime.
          </Text>

          <Text style={styles.faqQuestion}>• How do I contact an administrator?</Text>
          <Text style={styles.faqAnswer}>
            Use the Contact Support button below to connect with the admin team.
          </Text>

          <Text style={styles.faqQuestion}>• I am not receiving notifications</Text>
          <Text style={styles.faqAnswer}>
            Ensure app permissions are enabled in your device settings.
          </Text>
        </View>

        {/* Support Info */}
        <Text style={styles.sectionTitle}>Support Contact</Text>

        <View style={styles.supportInfoBox}>
          <Text style={styles.supportLabel}>Email:</Text>
          <Text style={styles.supportValue}>support@healthnest.com</Text>

          <Text style={styles.supportLabel}>Phone:</Text>
          <Text style={styles.supportValue}>+92 300 1234567</Text>

          <Text style={styles.supportLabel}>Available:</Text>
          <Text style={styles.supportValue}>24/7 Support Team</Text>
        </View>

        {/* Button */}
        <AppButton
          title="Contact Support"
          containerStyle={styles.supportBtn}
          textStyle={styles.supportBtnText}
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  headerGradient: {
    paddingBottom: 35,
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },

  introText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    marginBottom: 12,
    marginTop: 10,
  },

  faqContainer: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 25,
    elevation: 2,
  },

  faqQuestion: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginTop: 10,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
    lineHeight: 20,
  },

  supportInfoBox: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    elevation: 2,
    marginBottom: 20,
  },

  supportLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  supportValue: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.text,
    marginBottom: 10,
  },

  supportBtn: {
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
  },
  supportBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
