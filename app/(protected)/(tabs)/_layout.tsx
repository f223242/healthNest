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
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontFamily: Fonts.semiBold,
          marginBottom: 5,
        },
        tabBarStyle: {
         height:110,
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
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
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
