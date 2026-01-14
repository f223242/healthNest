import CustomTabBar from "@/component/CustomTabBar";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService, { Appointment } from "@/services/AppointmentService";
import NotificationService from "@/services/NotificationService";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

const _layout = () => {
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

  // Tab configuration for custom tab bar
  const tabs = [
    { name: "index", label: "Home", icon: "home-outline" as const, iconFilled: "home" as const },
    { name: "appointment", label: "Bookings", icon: "calendar-outline" as const, iconFilled: "calendar" as const, badge: appointmentBadge },
    { name: "madical-record", label: "Records", icon: "document-text-outline" as const, iconFilled: "document-text" as const },
    { name: "profile", label: "Profile", icon: "person-outline" as const, iconFilled: "person" as const },
  ];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* HOME */}
      <Tabs.Screen name="index" />

      {/* APPOINTMENTS */}
      <Tabs.Screen name="appointment" />

      {/* MEDICAL RECORDS */}
      <Tabs.Screen name="madical-record" />

      {/* PROFILE */}
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default _layout;
