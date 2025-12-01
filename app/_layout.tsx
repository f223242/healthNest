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
  const { user, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading user data

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(protected)";
    const inAdminGroup = segments[0] === "(admin)";
    const inNurseGroup = segments[0] === "(nurse)";
    const inDeliveryGroup = segments[0] === "(delivery)";
    const inLabGroup = segments[0] === "(lab)";

    console.log("User:", user);
    console.log("Current segment:", segments[0]);
    console.log("User role:", user?.role);

    if (user) {
      // Check user role and redirect accordingly
      if (user.role === "admin") {
        if (!inAdminGroup) {
          console.log("Redirecting to admin dashboard");
          router.replace("/(admin)/(dashboard)" as any);
        }
      } else if (user.role === "nurse") {
        if (!inNurseGroup) {
          console.log("Redirecting to nurse chats");
          router.replace("/(nurse)/nurse-chats" as any);
        }
      } else if (user.role === "delivery") {
        if (!inDeliveryGroup) {
          console.log("Redirecting to delivery chats");
          router.replace("/(delivery)/delivery-chats" as any);
        }
      } else if (user.role === "lab") {
        if (!inLabGroup) {
          console.log("Redirecting to lab dashboard");
          router.replace("/(lab)/(tabs)" as any);
        }
      } else if (user.role === "user") {
        if (!inProtectedGroup) {
          console.log("Redirecting to user tabs");
          router.replace("/(protected)/(tabs)");
        }
      } else if (!user.role) {
        // User without role (backward compatibility) - redirect to protected
        if (!inProtectedGroup) {
          console.log("Redirecting to user tabs (no role)");
          router.replace("/(protected)/(tabs)");
        }
      }
    } else if (!user && !inAuthGroup) {
      // User not logged in and not in auth screens - redirect to auth
      console.log("Redirecting to auth");
      router.replace("/(auth)");
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
