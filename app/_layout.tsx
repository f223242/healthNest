import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuthContext } from "@/hooks/useContext";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  // useEffect(() => {
  //   const inAuthGroup = segments[0] === "(auth)";

  //   console.log("User:", user);
  //   console.log("Current segment:", segments[0]);
  //   console.log("Will show:", user ? "(protected) screens" : "(auth) screens");

  //   if (user && inAuthGroup) {
  //     // User logged in - redirect to protected
  //     router.replace("/(protected)/(tabs)");
  //   } else if (!user && !inAuthGroup) {
  //     // User logged out - redirect to auth
  //     router.replace("/(auth)");
  //   }
  // }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="(auth)" /> */}
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}
