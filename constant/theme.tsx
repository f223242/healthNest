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
  white: "#FFFFFF",
  black: "#000000",
  colors: ["#167738", "#246BFD"] as const,
  green: "#167738",
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
});
