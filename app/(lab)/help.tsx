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
      question: "How do I process a new test request?",
      answer: "Go to Test Requests tab, select the pending test, and mark it as 'Sample Collected' once you receive the sample.",
    },
    {
      question: "How do I generate a lab report?",
      answer: "After test completion, go to Reports tab, select the test, and click 'Generate Report' to create the final report.",
    },
    {
      question: "How do I update my profile?",
      answer: "Navigate to your Profile tab and tap on 'Edit Profile' to update your details.",
    },
    {
      question: "How do I contact support?",
      answer: "Use the Contact Support button below or email us at lab-support@healthnest.com.",
    },
    {
      question: "What if a sample is rejected?",
      answer: "Mark the test as 'Sample Rejected' with a reason, and request a new sample from the patient.",
    },
  ];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
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
          <Text style={styles.subtitle}>We're here to assist you anytime</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {/* Intro Text */}
        <Text style={styles.introText}>
          If you need help using the lab portal, have issues with test processing, or want to report a problem, explore the sections below or contact our support team.
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
              { icon: "document-text-outline", title: "Lab Guidelines" },
              { icon: "shield-checkmark-outline", title: "Quality Standards" },
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  introText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  faqWrapper: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  quickLinksContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  quickLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
});
