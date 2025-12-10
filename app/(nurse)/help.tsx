import FAQAccordion, { FAQItem } from "@/component/FAQAccordion";
import { colors, Fonts, sizes } from "@/constant/theme";
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00C853"]}
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="headset" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>We're here to assist you anytime</Text>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
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
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    textAlign: "center",
    marginRight: 40,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
    paddingBottom: 40,
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
   contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop:16,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
});
