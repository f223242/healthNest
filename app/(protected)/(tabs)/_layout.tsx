import {
  AppointmentFilled,
  AppointmentUnfilled,
  BellIcon,
  HomeFilled,
  HomeUnfilled,
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
        // headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarLabelStyle: { fontSize: 12, fontFamily: Fonts.medium },
        headerTitleAlign: "center",

        tabBarInactiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          tabBarLabel: "Home",
          headerShadowVisible: false,
          headerTitle: "",
          headerRight: () => <BellIcon style={{ marginRight: 16 }} />,
          tabBarIcon: ({ focused }) => {
            return focused ? <HomeFilled /> : <HomeUnfilled />;
          },
        }}
      />

      <Tabs.Screen
        name="appointment"
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: ({ focused }) => {
            return focused ? <AppointmentFilled /> : <AppointmentUnfilled />;
          },
        }}
      />
      <Tabs.Screen
        name="madical-record"
        options={{
          tabBarLabel: "Medical Records",
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <MedicalRecordUnfilled />
            ) : (
              <MedicalRecordUnfilled />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => {
            return focused ? <ProfileFilled /> : <ProfileUnfilled />;
          },
        }}
      />
    </Tabs>
  );
};

export default _layout;
