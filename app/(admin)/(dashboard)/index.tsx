import AdminStatCard from "@/component/admin/AdminStatCard";
import PremiumActionCard from "@/component/PremiumActionCard";
import SectionHeader from "@/component/SectionHeader";
import { colors, Fonts, sizes } from "@/constant/theme";
import { AdminInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from "react-native-safe-area-context";

const AdminDashboard = () => {
  const router = useRouter();
  const { getAllUsers, user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    users: 0,
    nurses: 0,
    labs: 0,
    delivery: 0,
  });

  const adminInfo = user?.additionalInfo as AdminInfo | undefined;
  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Admin';

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
      <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      <LinearGradient
        colors={['#1E293B', '#334155', '#475569'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animatable.View animation="fadeInDown" duration={600} style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Admin Dashboard</Text>
            <Text style={styles.nameText}>{fullName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#1E293B', '#475569'] as const}
              style={styles.avatarPlaceholder}
            >
              <Ionicons name="shield-checkmark" size={24} color={colors.white} />
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* Summary Stats in Header */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userStats.total}</Text>
            <Text style={styles.headerStatLabel}>Total Users</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userStats.nurses}</Text>
            <Text style={styles.headerStatLabel}>Nurses</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userStats.labs}</Text>
            <Text style={styles.headerStatLabel}>Labs</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userStats.delivery}</Text>
            <Text style={styles.headerStatLabel}>Delivery</Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.section}>
          <SectionHeader
            title="User Statistics"
            icon="stats-chart"
            animation="fadeInUp"
            delay={200}
          />
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={250 + index * 50}
                style={styles.statCardWrapper}
              >
                <AdminStatCard {...stat} />
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            icon="flash"
            animation="fadeInUp"
            delay={400}
          />

          <PremiumActionCard
            title="Manage Users"
            subtitle="View, edit, and manage all users"
            icon="people"
            gradient
            gradientColors={['#1E293B', '#475569'] as const}
            onPress={() => router.push("/(admin)/(dashboard)/users" as any)}
            animation="fadeInUp"
            delay={450}
          />

          <PremiumActionCard
            title="View Complaints"
            subtitle="Review and respond to user complaints"
            icon="chatbox-ellipses"
            color="#FF9800"
            onPress={() => router.push("/(admin)/(dashboard)/complaints" as any)}
            animation="fadeInUp"
            delay={500}
          />

          <PremiumActionCard
            title="User Verifications"
            subtitle="Review and approve identity verifications"
            icon="shield-checkmark"
            color="#4CAF50"
            onPress={() => router.push("/(admin)/(dashboard)/verifications" as any)}
            animation="fadeInUp"
            delay={550}
          />

          <PremiumActionCard
            title="BNPL Applications"
            subtitle="Manage Buy Now Pay Later requests"
            icon="card"
            color="#9C27B0"
            onPress={() => router.push("/(admin)/(dashboard)/bnpl" as any)}
            animation="fadeInUp"
            delay={600}
          />
        </View>

        {/* Admin Info Card */}
        <Animatable.View animation="fadeInUp" delay={550} style={styles.section}>
          <LinearGradient
            colors={['#1E293B', '#475569'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adminInfoCard}
          >
            <View style={styles.adminInfoIcon}>
              <Ionicons name="information-circle" size={28} color={colors.white} />
            </View>
            <View style={styles.adminInfoContent}>
              <Text style={styles.adminInfoTitle}>System Status</Text>
              <Text style={styles.adminInfoText}>
                All systems are running smoothly. {userStats.users} patients registered.
              </Text>
            </View>
          </LinearGradient>
        </Animatable.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    elevation: 8,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  nameText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 4,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerStatLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  headerStatDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
    marginTop: -15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCardWrapper: {
    width: "48%",
  },
  adminInfoCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  adminInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminInfoContent: {
    flex: 1,
  },
  adminInfoTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    marginBottom: 4,
  },
  adminInfoText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
});
