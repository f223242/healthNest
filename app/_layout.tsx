import { ToastProvider } from "@/component/Toast/ToastProvider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuthContext } from "@/hooks/useFirebaseAuth";
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
    <ToastProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ToastProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";
  const inProtectedGroup = segments[0] === "(protected)";
  const inAdminGroup = segments[0] === "(admin)";
  const inNurseGroup = segments[0] === "(nurse)";
  const inDeliveryGroup = segments[0] === "(delivery)";
  const inLabGroup = segments[0] === "(lab)";

  // Role-based navigation using useEffect
  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Admin role
      if (user.role === "admin" && !inAdminGroup) {
        router.replace("/(admin)/(dashboard)" as any);
        return;
      }
      // Nurse role
      if (user.role === "nurse" && !inNurseGroup) {
        router.replace("/(nurse)/(tabs)" as any);
        return;
      }
      // Delivery role
      if (user.role === "delivery" && !inDeliveryGroup) {
        router.replace("/(delivery)/(tabs)" as any);
        return;
      }
      // Lab role
      if (user.role === "lab" && !inLabGroup) {
        router.replace("/(lab)/(tabs)" as any);
        return;
      }
      // User role (default)
      if ((user.role === "user" || !user.role) && !inProtectedGroup) {
        router.replace("/(protected)/(tabs)" as any);
        return;
      }
    } else {
      // Not logged in - redirect to auth
      if (!inAuthGroup) {
        router.replace("/(auth)" as any);
      }
    }
  }, [user, isLoading, segments]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#009963" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(protected)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(nurse)" />
      <Stack.Screen name="(delivery)" />
      <Stack.Screen name="(lab)" />
    </Stack>
  );
}
