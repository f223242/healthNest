import {
  AppointmentFilled,
  AppointmentUnfilled,
  BellIcon,
  HomeFilled,
  HomeUnfilled,
  MedicalRecordFilled,
  MedicalRecordUnfilled,
  ProfileFilled,
  ProfileUnfilled,
} from "@/assets/svg";
import { colors, Fonts } from "@/constant/theme";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: { fontSize: 12, fontFamily: Fonts.medium },
        headerTitleAlign: "center",
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "",
          headerRight: () => <BellIcon style={{ marginRight: 16 }} />,
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? <HomeFilled /> : <HomeUnfilled />,
        }}
      />

      {/* APPOINTMENTS */}
      <Tabs.Screen
        name="appointment"
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: ({ focused }) =>
            focused ? <AppointmentFilled /> : <AppointmentUnfilled />,
        }}
      />

      {/* MEDICAL RECORDS */}
      <Tabs.Screen
        name="madical-record"
        options={{
          tabBarLabel: "Medical Records",
          tabBarIcon: ({ focused }) =>
            focused ? <MedicalRecordFilled /> : <MedicalRecordUnfilled />,
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) =>
            focused ? <ProfileFilled /> : <ProfileUnfilled />,

          // Header
          headerTitleStyle: {
            fontFamily: Fonts.medium,
            color: colors.white,
          },
          headerShadowVisible: false,
          headerTitle: "Profile",

          headerStyle: {
            backgroundColor: colors.primary,
          },
        }}
      />
    </Tabs>
  );
};

export default _layout;
