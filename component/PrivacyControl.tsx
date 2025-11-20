import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

interface PrivacyControlProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const PrivacyControl: React.FC<PrivacyControlProps> = ({
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <View style={styles.settingCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E5E5", true: "#A6D8C1" }}
        thumbColor={enabled ? colors.primary : "#f4f3f4"}
      />
    </View>
  );
};

export default PrivacyControl;

const styles = StyleSheet.create({
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
});
