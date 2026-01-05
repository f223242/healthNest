import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  visible?: boolean;
}

interface FeaturesGridProps {
  features: FeatureItem[];
  title?: string;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ features, title = "Features" }) => {
  const visibleFeatures = features.filter((f) => f.visible !== false);

  if (visibleFeatures.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.featuresGrid}>
        {visibleFeatures.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: feature.iconColor + "15" },
              ]}
            >
              <Ionicons name={feature.icon} size={22} color={feature.iconColor} />
            </View>
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default FeaturesGrid;

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
    flex: 1,
  },
});
