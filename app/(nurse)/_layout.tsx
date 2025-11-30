import HomeHeader from '@/component/HomeHeader';
import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function NurseLayout() {
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
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: true,
          header: () => (
            <HomeHeader
              notificationCount={5}
              onNotificationPress={() => {}}
            />
          ),
          headerStyle: { backgroundColor: 'transparent' },
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nurse-chats"
        options={{
          title: 'Chats',
          headerShown: true,
          header: () => (
            <HomeHeader
              title="Patient Chats"
              subtitle="Connect with your patients instantly"
              // notificationCount={3}
              onNotificationPress={() => {}}
              leftAction={
                <Ionicons name="chatbubbles" size={24} color={colors.white} />
              }
            />
          ),
          headerStyle: { backgroundColor: 'transparent' },
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nurse-chat-detail"
        options={{
          href: null,
          headerShown: true,
          headerShadowVisible: true,
          headerTitle: 'Chat',
          headerTitleStyle: {
            fontFamily: Fonts.bold,
            fontSize: 20,
          },
        }}
      />
    </Tabs>
  );
}
