import HomeHeader from '@/component/HomeHeader';
import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NurseLayout() {
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
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      {/* Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: true,
          header: () => (
            <HomeHeader
              rightAction={
                <TouchableOpacity onPress={logout} accessibilityLabel="Logout">
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={colors.white}
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
              }
              title="Nurse Dashboard"
              subtitle="Manage your nursing services"
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

      {/* Chats */}
      <Tabs.Screen
        name="nurse-chats"
        options={{
          title: 'Chats',
          headerShown: true,
          header: () => (
            <HomeHeader
              title="Patient Chats"
              subtitle="Connect with your patients instantly"
              onNotificationPress={() => {}}
              leftAction={
                <Ionicons name="chatbubbles" size={40} color={colors.white} />
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
      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: true,
          headerTitle: "Profile", 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
