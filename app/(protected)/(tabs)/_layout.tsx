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
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService, { Appointment } from "@/services/AppointmentService";
import NotificationService from "@/services/NotificationService";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Badge component
const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
};

const _layout = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [appointmentBadge, setAppointmentBadge] = useState(0);
  const [notificationBadge, setNotificationBadge] = useState(0);

  // Listen for pending appointments (for users)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToUserAppointments(
      user.uid,
      (appointments: Appointment[]) => {
        // Count pending appointments that need attention
        const pendingCount = appointments.filter(
          (apt) => apt.status === "pending" || apt.status === "accepted"
        ).length;
        setAppointmentBadge(pendingCount);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen for unread notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationService.listenToNotifications(
      user.uid,
      (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        setNotificationBadge(unreadCount);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
          tabBarIcon: ({ focused }) => (
            <View>
              {focused ? <AppointmentFilled /> : <AppointmentUnfilled />}
              <TabBadge count={appointmentBadge} />
            </View>
          ),
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

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
});
