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
import { colors, Fonts } from "@/constant/theme";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const _layout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Fonts.semiBold,
          marginTop: -2,
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
          height: 75,
          paddingTop: 8,
          paddingBottom: insets.bottom ? insets.bottom / 2 : 12,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          height: 60,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? <HomeFilled /> : <HomeUnfilled />,
        }}
      />

      {/* APPOINTMENTS */}
      <Tabs.Screen
        name="appointment"
        options={{
          tabBarLabel: "Bookings",
          tabBarIcon: ({ focused }) =>
            focused ? <AppointmentFilled /> : <AppointmentUnfilled />,
        }}
      />

      {/* MEDICAL RECORDS */}
      <Tabs.Screen
        name="madical-record"
        options={{
          tabBarLabel: "Records",
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
        }}
      />

    </Tabs>
  );
};

export default _layout;
