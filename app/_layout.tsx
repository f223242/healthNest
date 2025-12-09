import { ToastProvider } from "@/component/Toast/ToastProvider";
import { AuthProvider, useAuthContext } from "@/hooks/useFirebaseAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const PENDING_USER_KEY = "@healthnest_pending_user";

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InnerLayout />
      </AuthProvider>
    </ToastProvider>
  );
}

function InnerLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();
  const [hasPendingUser, setHasPendingUser] = useState<boolean | null>(null);

  const role = user?.role || "user";

  // Check for pending user (during email verification)
  useEffect(() => {
    const checkPendingUser = async () => {
      const pendingUser = await AsyncStorage.getItem(PENDING_USER_KEY);
      setHasPendingUser(!!pendingUser);
    };
    checkPendingUser();
    
    // Periodic check to detect changes quickly
    const interval = setInterval(checkPendingUser, 500);
    return () => clearInterval(interval);
  }, []);

  // Navigation logic
  useEffect(() => {
    if (!fontsLoaded || isLoading || hasPendingUser === null) return;

    const currentGroup = segments[0] as string | undefined;
    const currentScreen = segments[1] as string | undefined;

    // User is NOT logged in
    if (!user) {
      // If there's a pending user awaiting verification, go to OTP screen
      if (hasPendingUser && currentScreen !== "otp-screen") {
        router.replace("/(auth)/otp-screen");
        return;
      }

      // If already in auth group, allow navigation within auth screens
      if (currentGroup === "(auth)") {
        return;
      }

      // Otherwise redirect to login
      router.replace("/(auth)");
      return;
    }

    // User IS logged in - redirect based on role
    if (role === "admin" && currentGroup !== "(admin)") {
      router.replace("/(admin)/(dashboard)");
      return;
    }

    if (role === "nurse" && currentGroup !== "(nurse)") {
      router.replace("/(nurse)/(tabs)");
      return;
    }

    if (role === "delivery" && currentGroup !== "(delivery)") {
      router.replace("/(delivery)/(tabs)");
      return;
    }

    if (role === "lab" && currentGroup !== "(lab)") {
      router.replace("/(lab)/(tabs)");
      return;
    }

    if (role === "user" && currentGroup !== "(protected)") {
      router.replace("/(protected)/(tabs)");
      return;
    }
  }, [user, isLoading, fontsLoaded, segments, hasPendingUser, role]);

  // Show loading while initializing
  if (!fontsLoaded || isLoading || hasPendingUser === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#009963" />
      </View>
    );
  }

  // Render all screen groups - navigation logic handles access
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(nurse)" />
      <Stack.Screen name="(delivery)" />
      <Stack.Screen name="(lab)" />
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}
