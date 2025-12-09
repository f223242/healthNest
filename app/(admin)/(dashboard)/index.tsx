import AdminStatCard from "@/component/admin/AdminStatCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminDashboard = () => {
  const router = useRouter();
  const { getAllUsers } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    users: 0,
    nurses: 0,
    labs: 0,
    delivery: 0,
  });

  // Fetch user stats from Firebase
  const fetchStats = useCallback(async () => {
    try {
      const allUsers = await getAllUsers();
      
      const stats = {
        total: allUsers.length,
        users: allUsers.filter(u => u.role === "user").length,
        nurses: allUsers.filter(u => u.role === "nurse").length,
        labs: allUsers.filter(u => u.role === "lab").length,
        delivery: allUsers.filter(u => u.role === "delivery").length,
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const stats = useMemo(() => [
    {
      title: "Total Users",
      value: userStats.total.toString(),
      icon: "people" as const,
      gradientColors: [colors.primary, "#00D68F"],
      trend: { value: `${userStats.users} patients`, isUp: true },
    },
    {
      title: "Nurses",
      value: userStats.nurses.toString(),
      icon: "medkit" as const,
      gradientColors: ["#9C27B0", "#BA68C8"],
      trend: { value: "Registered", isUp: true },
    },
    {
      title: "Labs",
      value: userStats.labs.toString(),
      icon: "flask" as const,
      gradientColors: ["#2196F3", "#64B5F6"],
      trend: { value: "Registered", isUp: true },
    },
    {
      title: "Delivery",
      value: userStats.delivery.toString(),
      icon: "bicycle" as const,
      gradientColors: ["#FF9800", "#FFB74D"],
      trend: { value: "Registered", isUp: true },
    },
  ], [userStats]);

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all users",
      icon: "people-outline" as const,
      color: "#E8F5F0",
      onPress: () => router.push("/(admin)/(dashboard)/users" as any),
    },
    {
      title: "View Complaints",
      description: "Review user complaints",
      icon: "chatbox-ellipses-outline" as const,
      color: "#FFF4E6",
      onPress: () => router.push("/(admin)/(dashboard)/complaints" as any),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={["bottom"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
    

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCardWrapper}>
                <AdminStatCard {...stat} />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon} size={28} color={colors.primary} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: sizes.paddingHorizontal,
    
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCardWrapper: {
    width: "48%",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
