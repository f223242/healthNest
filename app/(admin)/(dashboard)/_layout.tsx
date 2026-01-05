import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService, { Complaint } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Badge component
const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
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
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
});

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [complaintsBadge, setComplaintsBadge] = useState(0);
  const [pendingVerificationsBadge, setPendingVerificationsBadge] = useState(0);

  // Listen for pending complaints
  useEffect(() => {
    const unsubscribe = FeedbackComplaintService.listenToComplaints(
      (complaints: Complaint[]) => {
        const pendingCount = complaints.filter(
          (c) => c.status === "pending"
        ).length;
        setComplaintsBadge(pendingCount);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen for pending verifications (BNPL + Identity)
  useEffect(() => {
    // This would need VerificationService listener - for now use complaints as indicator
    // The badge on Dashboard will show pending complaints that need attention
    const unsubscribe = FeedbackComplaintService.listenToComplaints(
      (complaints: Complaint[]) => {
        // Count new complaints (last 24 hours) that are pending
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const newPendingCount = complaints.filter(
          (c) => c.status === "pending" && c.createdAt.toMillis() > oneDayAgo
        ).length;
        setPendingVerificationsBadge(newPendingCount);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E293B',
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
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
              <TabBadge count={pendingVerificationsBadge} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          headerShown: false,
          title: "Users",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          headerShown: false,
          title: "Complaints",
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons name={focused ? "chatbox-ellipses" : "chatbox-ellipses-outline"} size={size} color={color} />
              <TabBadge count={complaintsBadge} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens - accessible from dashboard but not in tab bar */}
      <Tabs.Screen
        name="verifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="bnpl"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
