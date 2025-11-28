import { colors, Fonts } from "@/constant/theme";
import { Stack, useRouter } from "expo-router";
import React from "react";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.black,
        headerTitleStyle: {
          fontFamily: Fonts.bold,
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(dashboard)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
