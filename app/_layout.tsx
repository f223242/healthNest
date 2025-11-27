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
    const inAdminGroup = segments[0] === "(admin)" as any;

    console.log("User:", user);
    console.log("Current segment:", segments[0]);
    console.log("User role:", user?.role);

    if (user) {
      // Check if user is admin
      if (user.role === "admin" && !inAdminGroup) {
        // Admin logged in but not in admin screens - redirect to admin
        router.replace("/(admin)/(dashboard)" as any);
      } else if (user.role === "user" && !inProtectedGroup) {
        // Regular user logged in but not in protected screens - redirect to protected
        router.replace("/(protected)/(tabs)");
      } else if (!user.role && !inProtectedGroup) {
        // User without role (backward compatibility) - redirect to protected
        router.replace("/(protected)/(tabs)");
      }
    } else if (!user && !inAuthGroup) {
      // User not logged in and not in auth screens - redirect to auth
      router.replace("/(auth)");
    }
  }, [user, isLoading]);

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
    </Stack>
  );
}
