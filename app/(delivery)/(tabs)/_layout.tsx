import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import AppointmentService from '@/services/AppointmentService';
import ChatService from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Badge component
const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
};

export default function DeliveryTabsLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [chatBadge, setChatBadge] = useState(0);
  const [appointmentBadge, setAppointmentBadge] = useState(0);

  // Listen to chats
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

  // Listen to pending appointments
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToDeliveryAppointments(
      user.uid,
      (appointments) => {
        const pendingCount = appointments.filter(a => a.status === "pending").length;
        setAppointmentBadge(pendingCount);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: {
          fontSize: 11,
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
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Requests/Appointments */}
      <Tabs.Screen
        name="requests"
        options={{
          headerShown: false,
          tabBarLabel: 'Requests',
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} size={22} color={color} />
              <TabBadge count={appointmentBadge} />
            </View>
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
            <View>
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
              <TabBadge count={chatBadge} />
            </View>
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
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
});
