import { Fonts } from "@/constant/theme";
import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 18,
          fontFamily: Fonts.bold,
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Login",
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerTitle: "Sign Up",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerTitle: "Forgot Password",
        }}
      />
      <Stack.Screen
        name="otp-screen"
        options={{
          headerTitle: "Verification",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerTitle: "Reset Password",
        }}
      />
    </Stack>
  );
};

export default _layout;
