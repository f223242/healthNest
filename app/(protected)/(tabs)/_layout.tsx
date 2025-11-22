import {
  AppointmentFilled,
  AppointmentUnfilled,
  HomeFilled,
  HomeUnfilled,
  MedicalRecordFilled,
  MedicalRecordUnfilled,
  ProfileFilled,
  ProfileUnfilled,
} from "@/assets/svg";
import HomeHeader from "@/component/HomeHeader";
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
          header: () => <HomeHeader notificationCount={5} />,
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
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) =>
            focused ? <ProfileFilled /> : <ProfileUnfilled />,
        }}
      />
    </Tabs>
  );
};

export default _layout;
