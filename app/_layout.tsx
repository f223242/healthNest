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

  // Check if there's a pending user (in verification process)
  useEffect(() => {
    const checkPendingUser = async () => {
      const pendingUser = await AsyncStorage.getItem(PENDING_USER_KEY);
      setHasPendingUser(!!pendingUser);
    };
    checkPendingUser();
    
    // Also add listener for storage changes
    const interval = setInterval(checkPendingUser, 500);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  //  Navigation Logic
  // -----------------------------
  useEffect(() => {
    if (!fontsLoaded || isLoading || hasPendingUser === null) return;

    const current = segments[0];
    const currentScreen = segments[1];

    // Not logged in
    if (!user) {
      // If in auth group, allow all auth screens (no redirects within auth)
      if (current === "(auth)") {
        return;
      }
      
      // Redirect to auth if not in auth group
      router.replace("/(auth)");
      return;
    }

    // User is logged in - redirect based on role
    // Only redirect if not already in the correct group
    // User is logged in - redirect based on role
    // Only redirect if not already in the correct group
    if (role === "admin" && current !== "(admin)") {
      router.replace("/(admin)/(dashboard)");
      return;
    }

    if (role === "nurse" && current !== "(nurse)") {
      router.replace("/(nurse)/(tabs)");
      return;
    }

    if (role === "delivery" && current !== "(delivery)") {
      router.replace("/(delivery)/(tabs)");
      return;
    }

    if (role === "lab" && current !== "(lab)") {
      router.replace("/(lab)/(tabs)");
      return;
    }

    if (role === "user" && current !== "(protected)") {
      router.replace("/(protected)/(tabs)");
      return;
    }
  }, [user, isLoading, fontsLoaded, segments, hasPendingUser]);

  // -----------------------------
  // Loaders
  // -----------------------------
  if (!fontsLoaded || isLoading || hasPendingUser === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#009963" />
      </View>
    );
  }

  // -----------------------------
  // Allowed Screens
  // -----------------------------
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
