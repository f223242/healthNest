import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface StatItem {
  type: "number" | "icon";
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
}

interface StatsRowProps {
  stats: StatItem[];
}

const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          {index > 0 && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            {stat.type === "number" ? (
              <Text style={styles.statNumber}>{stat.value}</Text>
            ) : (
              <Ionicons
                name={stat.icon || "star"}
                size={24}
                color={stat.iconColor || colors.primary}
              />
            )}
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

export default StatsRow;

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderGray,
  },
});
