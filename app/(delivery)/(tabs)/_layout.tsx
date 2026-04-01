import CustomTabBar from "@/component/CustomTabBar";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import AppointmentService from "@/services/AppointmentService";
import ChatService from "@/services/ChatService";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function DeliveryTabsLayout() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [chatBadge, setChatBadge] = useState(0);
  const [appointmentBadge, setAppointmentBadge] = useState(0);

  // Strict guard: Block lab-delivery-boy access if not approved
  useEffect(() => {
    if (user?.role === "lab-delivery-boy" && user.isApproved !== true) {
      router.replace("/(delivery)/pending-verification" as any);
      return;
    }
  }, [user, router]);

  // Listen to chats
  useEffect(() => {
    if (!user) return;

    const unsubscribe = ChatService.listenToConversations(
      user.uid,
      (conversations) => {
        const count = conversations.reduce(
          (acc, curr) => acc + (curr.unreadCount || 0),
          0,
        );
        setChatBadge(count);
      },
      true,
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to pending appointments
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToDeliveryAppointments(
      user.uid,
      (appointments) => {
        const pendingCount = appointments.filter(
          (a) => a.status === "pending",
        ).length;
        setAppointmentBadge(pendingCount);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Tab configuration for custom tab bar
  const tabs = [
    {
      name: "index",
      label: "Home",
      icon: "home-outline" as const,
      iconFilled: "home" as const,
    },
    {
      name: "requests",
      label: "Requests",
      icon: "clipboard-outline" as const,
      iconFilled: "clipboard" as const,
      badge: appointmentBadge,
    },
    {
      name: "delivery-chats",
      label: "Chats",
      icon: "chatbubbles-outline" as const,
      iconFilled: "chatbubbles" as const,
      badge: chatBadge,
    },
    {
      name: "profile",
      label: "Profile",
      icon: "person-outline" as const,
      iconFilled: "person" as const,
    },
  ];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="delivery-chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
