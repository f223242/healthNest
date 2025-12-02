import AppButton from "@/component/AppButton";
import FAQAccordion, { FAQItem } from "@/component/FAQAccordion";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = () => {
  const faqs: FAQItem[] = [
    {
      question: "How do I reset my password?",
      answer: "Go to Settings → Change Password. Follow instructions to create a new password.",
    },
    {
      question: "How do I update my profile?",
      answer: "Navigate to your Profile tab and update your details anytime.",
    },
    {
      question: "How do I contact an administrator?",
      answer: "Use the Contact Support button below to connect with the admin team.",
    },
    {
      question: "I am not receiving notifications",
      answer: "Ensure app permissions are enabled in your device settings.",
    },
  ];

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
        <View style={styles.faqWrapper}>
          <FAQAccordion faqs={faqs} accentColor={colors.primary} />
        </View>

          {/* Quick Links */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Links</Text>
                <View style={styles.quickLinksContainer}>
                  {[
                    { icon: "document-text-outline", title: "Terms of Service" },
                    { icon: "shield-checkmark-outline", title: "Privacy Policy" },
                    { icon: "chatbubble-ellipses-outline", title: "Live Chat" },
                    { icon: "mail-outline", title: "Email Support" },
                  ].map((item, index) => (
                    <TouchableOpacity key={index} style={styles.quickLinkItem}>
                      <View style={styles.quickLinkIcon}>
                        <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                      </View>
                      <Text style={styles.quickLinkText}>{item.title}</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.gray} />
                    </TouchableOpacity>
                  ))}
                </View>
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

  faqWrapper: {
    marginBottom: 25,
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
   quickLinksContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray + "50",
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
    section: {
    marginBottom: 24,
  },
});
