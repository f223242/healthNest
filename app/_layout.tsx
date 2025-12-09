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
  
  // State to differentiate between email verification and password reset
  const [pendingUserType, setPendingUserType] = useState<"none" | "verification" | "passwordReset" | null>(null);

  // Check for pending user (during email verification or password reset)
  useEffect(() => {
    const checkPendingUser = async () => {
      const pendingUserStr = await AsyncStorage.getItem(PENDING_USER_KEY);
      if (!pendingUserStr) {
        setPendingUserType("none");
        setHasPendingUser(false);
        return;
      }
      
      try {
        const pendingUser = JSON.parse(pendingUserStr);
        
        // Check if pending user data is expired (older than 10 minutes)
        if (pendingUser.createdAt) {
          const createdAt = new Date(pendingUser.createdAt);
          const now = new Date();
          const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
          
          if (diffMinutes > 10) {
            // Expired - clear the data
            console.log("Pending user data expired, clearing...");
            await AsyncStorage.removeItem(PENDING_USER_KEY);
            await AsyncStorage.removeItem("@healthnest_otp");
            setPendingUserType("none");
            setHasPendingUser(false);
            return;
          }
        }
        
        if (pendingUser.isPasswordReset) {
          setPendingUserType("passwordReset");
          setHasPendingUser(true);
        } else {
          setPendingUserType("verification");
          setHasPendingUser(true);
        }
      } catch {
        // Invalid JSON - clear the data
        await AsyncStorage.removeItem(PENDING_USER_KEY);
        setPendingUserType("none");
        setHasPendingUser(false);
      }
    };
    checkPendingUser();
    
    // Periodic check to detect changes quickly
    const interval = setInterval(checkPendingUser, 500);
    return () => clearInterval(interval);
  }, []);

  // Navigation logic
  useEffect(() => {
    if (!fontsLoaded || isLoading || hasPendingUser === null || pendingUserType === null) return;

    const currentGroup = segments[0] as string | undefined;
    const currentScreen = segments[1] as string | undefined;

    // User is NOT logged in
    if (!user) {
      // If there's a pending user awaiting email verification, go to OTP screen
      if (pendingUserType === "verification" && currentScreen !== "otp-screen") {
        router.replace("/(auth)/otp-screen");
        return;
      }
      
      // If password reset flow, allow them to stay on reset-password screen
      if (pendingUserType === "passwordReset" && currentScreen !== "reset-password") {
        // Don't force redirect - they might be on forgot-password navigating to reset-password
        if (currentScreen !== "forgot-password") {
          router.replace("/(auth)/reset-password");
          return;
        }
      }

      // If already in auth group, allow navigation within auth screens
      if (currentGroup === "(auth)") {
        return;
      }

      // Otherwise redirect to login
      router.replace("/(auth)");
      return;
    }

    // User IS logged in - check if profile is completed (skip for admin)
    if (role !== "admin" && !user.profileCompleted && currentScreen !== "additional-info") {
      // Redirect to additional info screen
      router.replace("/(protected)/additional-info");
      return;
    }

    // User IS logged in and profile is completed - redirect based on role
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
  }, [user, isLoading, fontsLoaded, segments, hasPendingUser, pendingUserType, role]);

  // Show loading while initializing
  if (!fontsLoaded || isLoading || hasPendingUser === null || pendingUserType === null) {
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
