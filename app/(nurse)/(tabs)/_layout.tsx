import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
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

export default function NurseLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [chatBadge, setChatBadge] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen to conversations (Node: assuming Nurse is treated as "deliveryPerson" or provider side in ChatService)
    // Passing true for isDeliveryPerson to filter by deliveryPersonId
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
          headerShown: false,
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={24}
                color={color}
              />
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
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

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
