import FAQAccordion, { FAQItem } from "@/component/FAQAccordion";
import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Help = () => {
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
      question: "How do I accept a delivery order?",
      answer: "When a new order is available, you'll receive a notification. Open the app, go to Dashboard, and tap 'Accept' on the order card to start the delivery.",
    },
    {
      question: "How do I contact customers?",
      answer: "Use the Chats tab to send messages to customers. You can discuss delivery details, confirm addresses, or notify them about your arrival.",
    },
    {
      question: "What if I can't find the delivery address?",
      answer: "Contact the customer through the chat feature. You can also use the built-in navigation or ask the customer for landmarks.",
    },
    {
      question: "How do I report an issue with an order?",
      answer: "Go to Help & Support and contact our support team. Provide the order details and describe the issue for quick resolution.",
    },
    {
      question: "How are my earnings calculated?",
      answer: "Earnings are based on delivery distance, order value, and any applicable bonuses. Check your Profile for detailed earnings reports.",
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={["#FF6B35", "#FFA07A"]}
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
              <Ionicons name="headset" size={32} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>Available 24/7 to help you</Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call" size={18} color="#FF6B35" />
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
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
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
        </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FF6B35",
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
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
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
});
