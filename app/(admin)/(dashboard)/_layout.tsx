import CustomTabBar from "@/component/CustomTabBar";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService, { Complaint } from "@/services/FeedbackComplaintService";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

export default function DashboardLayout() {
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

  // Define tabs for CustomTabBar
  const adminTabs = [
    {
      name: "index",
      label: "Dashboard",
      icon: "grid-outline" as keyof typeof Ionicons.glyphMap,
      iconFilled: "grid" as keyof typeof Ionicons.glyphMap,
      badge: pendingVerificationsBadge,
    },
    {
      name: "users",
      label: "Users",
      icon: "people-outline" as keyof typeof Ionicons.glyphMap,
      iconFilled: "people" as keyof typeof Ionicons.glyphMap,
    },
    {
      name: "complaints",
      label: "Complaints",
      icon: "chatbox-ellipses-outline" as keyof typeof Ionicons.glyphMap,
      iconFilled: "chatbox-ellipses" as keyof typeof Ionicons.glyphMap,
      badge: complaintsBadge,
    },
    {
      name: "settings",
      label: "Settings",
      icon: "settings-outline" as keyof typeof Ionicons.glyphMap,
      iconFilled: "settings" as keyof typeof Ionicons.glyphMap,
    },
  ];

  // Admin theme color
  const adminColor = "#1E293B";

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} tabs={adminTabs} activeColor={adminColor} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="users" />
      <Tabs.Screen name="complaints" />
      <Tabs.Screen name="settings" />
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
