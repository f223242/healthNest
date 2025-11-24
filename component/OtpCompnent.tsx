import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OtpCompnentProps {
  text: string;
  label?: string;
}

const OtpCompnent = ({ text, label }: OtpCompnentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>
        <Text style={styles.textStyle}>{text}</Text>
      </View>
      {label && <Text style={styles.labelStyle}>{label}</Text>}
    </View>
  );
};

export default OtpCompnent;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  cardStyle: {
    height: 70,
    width: 70,
    borderRadius: 12,
    backgroundColor: "#E5F5F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textStyle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 8,
  },
});
