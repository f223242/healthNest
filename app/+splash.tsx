import { colors, Fonts } from "@/constant/theme";
import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/png/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>HealthNest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: colors.primary,
  },
  appName: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: colors.primary,
    marginTop: 16,
    letterSpacing: 1,
  },
});
