import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DeliveryTabsLayout() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();

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
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: insets.bottom ? insets.bottom : 12,
          height: 70,
          paddingBottom: insets.bottom ? insets.bottom / 2 : 10,
        },
        tabBarItemStyle: { paddingVertical: 5 },
        headerShown: false,
      }}
    >
      {/* Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* Chats */}
      <Tabs.Screen
        name="delivery-chats"
        options={{
          headerShown: false,
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
