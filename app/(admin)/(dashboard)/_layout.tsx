import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
            //  height:110,
                  backgroundColor: colors.white,
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 25,
                  borderTopWidth: 0,
                  elevation: 20,
                  shadowColor: colors.black,
                  shadowOffset: {
                    width: 0,
                    height: -5,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 15,
                  position: 'absolute',
                  paddingBottom: 10,
                  paddingTop:5,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 8,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.black,
        headerTitleStyle: {
          fontFamily: Fonts.bold,
          fontSize: 18,
        },
        headerShadowVisible: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: "Complaints",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
