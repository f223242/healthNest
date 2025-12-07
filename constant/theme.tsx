import { useFonts } from "expo-font";
import { Dimensions, StyleSheet } from "react-native";

// Sizes
export const sizes = {
  width: Dimensions.get("screen").width,
  height: Dimensions.get("screen").height,
  paddingHorizontal: 16,
};

export const colors = {
  primary: "#009963",
  secondary: "#246BFD",
  white: "#FFFFFF",
  black: "#000000",
  colors: ["#167738", "#246BFD"] as const,
  green: "#167738",
  lightGreen: "#E5F5F0",
  gray: "#666",
  lightGray: "#F8F8F8",
  borderGray: "#E5E5E5",
  danger: "#FF4444",
  yellow: "#FFA500",
  success: "#4CAF50",
  warning: "#FF9800",
  text: "#000000",
  textSecondary: "#666",
  background: "#F8F8F8",
};

export const useAppFonts = () =>
  useFonts({
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),

    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),

    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),

    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),

    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

export const Fonts = {
  thin: "Poppins-Thin",
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
};

export const appStyles = StyleSheet.create({
  h4: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  h3: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    lineHeight: 28,
  },
  // bottomTextStyle: {
  //   fontSize: 16,
  //   fontFamily: Fonts.bold,
  //   color: colors.primary,
  //   textAlign: "center",
  // },
  errorStyle: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.regular,
  },
  body1: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#0D1C17",
  },
  body2: {
    fontSize: 12,
    color: "#666",
    fontFamily: Fonts.regular,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  bodyText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  badge: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  caption: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  h2: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
});
