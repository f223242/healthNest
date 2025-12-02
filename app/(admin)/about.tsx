import { colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const About = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const features = [
    { icon: "people", title: "User Management", description: "Manage all users efficiently" },
    { icon: "shield-checkmark", title: "System Security", description: "Monitor and control access" },
    { icon: "stats-chart", title: "Analytics", description: "Track platform performance" },
    { icon: "settings", title: "Configuration", description: "Control system settings" },
  ];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <LinearGradient
          colors={[colors.primary, "#00B976", "#00D68F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.appCard}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="shield" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>HealthNest</Text>
          <Text style={styles.appTagline}>Admin Dashboard</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </LinearGradient>

        {/* About Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About HealthNest Admin</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              HealthNest Admin is a powerful control panel designed for administrators to manage the entire healthcare platform efficiently.
            </Text>
            <Text style={styles.descriptionText}>
              With comprehensive tools for user management, analytics, and system configuration, admins can ensure smooth platform operations.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            {[
              { icon: "logo-facebook", color: "#1877F2", url: "https://facebook.com" },
              { icon: "logo-twitter", color: "#1DA1F2", url: "https://twitter.com" },
              { icon: "logo-instagram", color: "#E4405F", url: "https://instagram.com" },
              { icon: "logo-linkedin", color: "#0A66C2", url: "https://linkedin.com" },
            ].map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { backgroundColor: social.color + "15" }]}
                onPress={() => openLink(social.url)}
              >
                <Ionicons name={social.icon as any} size={24} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in Pakistan</Text>
          <Text style={styles.copyrightText}>© 2025 HealthNest. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 40,
  },
  appCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white + "DD",
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: colors.white + "30",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
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
  descriptionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 22,
    marginBottom: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray + "AA",
  },
});
