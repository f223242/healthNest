import FAQAccordion, { FAQItem } from "@/component/FAQAccordion";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = () => {
  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />

      <LinearGradient
        colors={["#0891B2", "#22D3EE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerIconLarge}>
              <Ionicons name="help-circle-outline" size={40} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to assist you anytime</Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call" size={18} color="#0891B2" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
            {/* Intro Text */}
            <Text style={styles.introText}>
              If you need help using the lab portal, have issues with test processing, or want to report a problem, explore the sections below or contact our support team.
            </Text>

            {/* FAQ Section */}
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqWrapper}>
              <FAQAccordion faqs={faqs} accentColor="#0891B2" />
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
                      <Ionicons name={item.icon as any} size={22} color="#0891B2" />
                    </View>
                    <Text style={styles.quickLinkText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.gray} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0891B2",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerIconLarge: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    backgroundColor: "#0891B2" + "15",
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
