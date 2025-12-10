import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Fonts.semiBold,
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: insets.bottom ? insets.bottom : 12,
          height: 70,
          paddingBottom: insets.bottom ? insets.bottom / 2 : 10,
        },
        tabBarItemStyle: { paddingVertical: 5 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          headerShown: false,
          title: "Users",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          headerShown: false,
          title: "Complaints",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
