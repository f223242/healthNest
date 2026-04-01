import CustomTabBar from '@/component/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function LabTabsLayout() {
  // Tab configuration for custom tab bar
  const tabs = [
    { name: "index", label: "Home", icon: "home-outline" as const, iconFilled: "home" as const },
    { name: "test-requests", label: "Requests", icon: "flask-outline" as const, iconFilled: "flask" as const },
    { name: "chats", label: "Chats", icon: "chatbubbles-outline" as const, iconFilled: "chatbubbles" as const },
    { name: "reports", label: "Reports", icon: "document-text-outline" as const, iconFilled: "document-text" as const },
    { name: "profile", label: "Profile", icon: "person-outline" as const, iconFilled: "person" as const },
  ];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="test-requests" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
