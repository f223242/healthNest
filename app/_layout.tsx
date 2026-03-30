import { ToastProvider } from "@/component/Toast/ToastProvider";
import { AuthProvider, useAuthContext } from "@/hooks/useFirebaseAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const PENDING_USER_KEY = "@healthnest_pending_user";
const VERIFICATION_COMPLETE_KEY = "@healthnest_verification_complete";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <AuthProvider>
          <InnerLayout />
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
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
  const rootNavigationState = useRootNavigationState();
  const [hasPendingUser, setHasPendingUser] = useState<boolean | null>(null);

  // Track if we've already navigated to prevent loops
  const hasNavigatedRef = useRef(false);
  const lastNavigationRef = useRef<string>("");

  const role = user?.role || "user";

  // State to differentiate between email verification and password reset
  const [pendingUserType, setPendingUserType] = useState<
    "none" | "verification" | "passwordReset" | null
  >(null);

  // Track if verification was just completed to prevent redirect loop
  const [verificationJustCompleted, setVerificationJustCompleted] =
    useState(false);

  // Check for pending user (during email verification or password reset)
  useEffect(() => {
    const checkPendingUser = async () => {
      // Check if verification was just completed - skip redirect to otp-screen
      const verificationComplete = await AsyncStorage.getItem(
        VERIFICATION_COMPLETE_KEY,
      );
      if (verificationComplete) {
        // Clear the flag after reading
        await AsyncStorage.removeItem(VERIFICATION_COMPLETE_KEY);
        setVerificationJustCompleted(true);
        setPendingUserType("none");
        setHasPendingUser(false);
        return;
      }

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
          const diffMinutes =
            (now.getTime() - createdAt.getTime()) / (1000 * 60);

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

    // Periodic check to detect changes - increased to 1 second
    const interval = setInterval(checkPendingUser, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset navigation ref when user changes
  useEffect(() => {
    hasNavigatedRef.current = false;
    lastNavigationRef.current = "";
  }, [user?.uid, user?.profileCompleted]);

  // Safe navigation helper
  const safeNavigate = useCallback(
    (route: string) => {
      // Prevent duplicate navigations
      if (lastNavigationRef.current === route) {
        return;
      }
      lastNavigationRef.current = route;

      // Use setTimeout to ensure navigation happens after current render cycle
      setTimeout(() => {
        router.replace(route as any);
      }, 0);
    },
    [router],
  );

  // Navigation logic
  useEffect(() => {
    // Wait for navigation state to be ready
    if (!rootNavigationState?.key) return;
    if (
      !fontsLoaded ||
      isLoading ||
      hasPendingUser === null ||
      pendingUserType === null
    )
      return;

    const currentGroup = segments[0] as string | undefined;
    const currentScreen = segments[1] as string | undefined;
    const fullPath = segments.join("/");

    // User is NOT logged in
    if (!user) {
      // If verification was just completed, don't redirect to otp-screen
      if (verificationJustCompleted) {
        // Reset the flag after handling
        setVerificationJustCompleted(false);
        // Allow login screen to show
        if (currentGroup !== "(auth)") {
          safeNavigate("/(auth)");
        }
        return;
      }

      // If there's a pending user awaiting email verification, go to OTP screen
      // But don't redirect if we're on sign-up or education screens (in-lab delivery onboarding).
      if (pendingUserType === "verification") {
        // Only redirect to OTP if not already on signup/otp/education flow
        if (
          currentScreen !== "otp-screen" &&
          currentScreen !== "sign-up" &&
          currentScreen !== "education"
        ) {
          safeNavigate("/(auth)/otp-screen");
          return;
        }
        // If on sign-up, otp-screen, or education, don't redirect anywhere
        return;
      }

      // If password reset flow, allow them to stay on reset-password screen
      if (
        pendingUserType === "passwordReset" &&
        currentScreen !== "reset-password"
      ) {
        // Don't force redirect - they might be on forgot-password navigating to reset-password
        if (currentScreen !== "forgot-password") {
          safeNavigate("/(auth)/reset-password");
          return;
        }
      }

      // If already in auth group, allow navigation within auth screens
      if (currentGroup === "(auth)") {
        return;
      }

      // Otherwise redirect to login
      safeNavigate("/(auth)");
      return;
    }

    // User IS logged in - check if profile is completed (skip for admin)
    // Check both segment positions for additional-info (could be at different positions)
    const isOnAdditionalInfo =
      currentScreen === "additional-info" ||
      fullPath.includes("additional-info");

    const isOnEducation =
      currentScreen === "education" ||
      fullPath.includes("education");

    const isOnPendingVerification =
      currentScreen === "pending-verification" ||
      fullPath.includes("pending-verification");

    if (role !== "admin" && !user.profileCompleted && !isOnAdditionalInfo && !isOnEducation && !isOnPendingVerification) {
      // Redirect to additional info screen
      safeNavigate("/(protected)/additional-info");
      return;
    }

    // If profile is not completed, don't redirect to role-specific screens
    if (role !== "admin" && !user.profileCompleted) {
      return;
    }

    if (role === "lab-delivery-boy" && !user.educationSubmitted && !isOnEducation) {
      safeNavigate("/(auth)/education");
      return;
    }

    if (role === "lab-delivery-boy" && !user.educationSubmitted) {
      return;
    }

    if (role === "lab-delivery-boy" && user.educationSubmitted && !user.isApproved && !isOnPendingVerification && !isOnEducation) {
      safeNavigate("/(delivery)/pending-verification");
      return;
    }

    if (role === "lab-delivery-boy" && user.educationSubmitted && !user.isApproved) {
      return;
    }

    // User IS logged in and profile is completed - redirect based on role
    if (role === "admin" && currentGroup !== "(admin)") {
      safeNavigate("/(admin)/(dashboard)");
      return;
    }

    if (role === "nurse" && currentGroup !== "(nurse)") {
      safeNavigate("/(nurse)/(tabs)");
      return;
    }

    if (role === "delivery" && currentGroup !== "(delivery)") {
      safeNavigate("/(delivery)/(tabs)");
      return;
    }

    if (role === "lab-delivery-boy" && user.isApproved && currentGroup !== "(delivery)") {
      safeNavigate("/(delivery)/(tabs)");
      return;
    }

    if (role === "lab" && currentGroup !== "(lab)") {
      safeNavigate("/(lab)/(tabs)");
      return;
    }

    if (role === "user" && currentGroup !== "(protected)") {
      safeNavigate("/(protected)/(tabs)");
      return;
    }
  }, [
    user,
    isLoading,
    fontsLoaded,
    segments,
    hasPendingUser,
    pendingUserType,
    role,
    rootNavigationState?.key,
    safeNavigate,
  ]);

  // Show loading while initializing
  if (
    !fontsLoaded ||
    isLoading ||
    hasPendingUser === null ||
    pendingUserType === null
  ) {
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
