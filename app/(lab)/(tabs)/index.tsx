import DashboardStatCard from "@/component/DashboardStatCard";
import QuickActionCard from "@/component/QuickActionCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabDashboard = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get lab info
  const labInfo = useMemo(() => {
    return user?.additionalInfo as LabInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Lab Admin';

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />

      <LinearGradient
        colors={['#0891B2', '#06B6D4', '#22D3EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{fullName}</Text>
            </View>
            <View style={styles.headerAvatar}>
              <Ionicons name="flask" size={28} color="#0891B2" />
            </View>
          </View>

          {labInfo?.labName && (
            <View style={styles.labBadge}>
              <Ionicons name="business" size={14} color={colors.white} />
              <Text style={styles.labBadgeText}>{labInfo.labName}</Text>
            </View>
          )}

          {/* Quick Stats in Header */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Ionicons name="time" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.headerStatLabel}>{labInfo?.operatingHours || 'Not set'}</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Ionicons name="home" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.headerStatLabel}>{labInfo?.homeSampling ? 'Home Sampling' : 'Lab Only'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Stats Grid - Appointment Stats */}
            <View style={styles.statsContainer}>
              <DashboardStatCard
                title="Pending"
                value="12"
                icon="time-outline"
                color="#FF9800"
                containerStyle={styles.statCardHalf}
              />
              <DashboardStatCard
                title="Processing"
                value="5"
                icon="flask"
                color="#9C27B0"
                containerStyle={styles.statCardHalf}
              />
              <DashboardStatCard
                title="Completed"
                value="28"
                icon="checkmark-circle"
                color="#4CAF50"
                containerStyle={styles.statCardHalf}
              />
              <DashboardStatCard
                title="Total Today"
                value="45"
                icon="analytics"
                color="#0891B2"
                containerStyle={styles.statCardHalf}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <QuickActionCard
                title="Test Requests"
                subtitle="View and manage test requests"
                icon="flask"
                color="#0891B2"
                onPress={() => router.push("/(lab)/(tabs)/test-requests")}
              />
              <QuickActionCard
                title="Reports"
                subtitle="View and send reports"
                icon="document-text"
                color="#FF9800"
                onPress={() => router.push("/(lab)/(tabs)/reports")}
              />
              <QuickActionCard
                title="Edit Profile"
                subtitle="Update lab information"
                icon="settings"
                color="#9C27B0"
                onPress={() => router.push("/(lab)/edit-profile")}
              />
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default LabDashboard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0891B2',
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: sizes.paddingHorizontal,
    zIndex: 10,
    elevation: 8,
  },

  headerContent: {
    width: '100%',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
  },

  nameText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 4,
  },

  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  labBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },

  labBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.white,
  },

  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  headerStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  headerStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.white,
  },

  headerStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },

  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingBottom: 100,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },

  statCardHalf: {
    width: '48%',
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },

  quickActionsContainer: {
    marginBottom: 24,
  },

  infoSection: {
    paddingBottom: 20,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
});
