import CustomTabBar from '@/component/CustomTabBar';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import ChatService from '@/services/ChatService';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function NurseLayout() {
  const { user } = useAuthContext();
  const [chatBadge, setChatBadge] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = ChatService.listenToConversations(
      user.uid,
      (conversations) => {
        const count = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
        setChatBadge(count);
      },
      true
    );

    return () => unsubscribe();
  }, [user]);

  // Tab configuration for custom tab bar
  const tabs = [
    { name: "index", label: "Home", icon: "home-outline" as const, iconFilled: "home" as const },
    { name: "nurse-chats", label: "Chats", icon: "chatbubbles-outline" as const, iconFilled: "chatbubbles" as const, badge: chatBadge },
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
      <Tabs.Screen name="nurse-chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
