import DashboardStatCard from "@/component/DashboardStatCard";
import QuickActionCard from "@/component/QuickActionCard";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabDashboard = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  
  // Get lab info
  const labInfo = useMemo(() => {
    return user?.additionalInfo as LabInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Lab Admin';

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{fullName}</Text>
          {labInfo?.labName && (
            <View style={styles.labBadge}>
              <Ionicons name="flask" size={14} color="#2196F3" />
              <Text style={styles.labBadgeText}>{labInfo.labName}</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <DashboardStatCard
            title="Operating Hours"
            value={labInfo?.operatingHours || '-'}
            icon="time"
            color={colors.primary}
          />
          <DashboardStatCard
            title="Home Sampling"
            value={labInfo?.homeSampling ? 'Available' : 'Not Available'}
            icon="home"
            color="#2196F3"
          />
          <DashboardStatCard
            title="License"
            value={labInfo?.licenseNumber ? 'Verified' : 'Not Added'}
            icon="shield-checkmark"
            color="#4CAF50"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionCard
            title="Test Requests"
            subtitle="View and manage test requests"
            icon="flask"
            color={colors.primary}
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

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Lab Information</Text>
          
          {labInfo?.licenseNumber && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="card" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>License Number</Text>
                <Text style={styles.infoValue}>{labInfo.licenseNumber}</Text>
              </View>
            </View>
          )}
          
          {labInfo?.servicesOffered && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#FF9800' + '15' }]}>
                <Ionicons name="list" size={20} color="#FF9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Services Offered</Text>
                <Text style={styles.infoValue}>{labInfo.servicesOffered}</Text>
              </View>
            </View>
          )}
          
          {labInfo?.address && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#2196F3' + '15' }]}>
                <Ionicons name="location" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lab Address</Text>
                <Text style={styles.infoValue}>{labInfo.city ? `${labInfo.city}` : labInfo.address}</Text>
              </View>
            </View>
          )}
          
          {user?.phoneNumber && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#4CAF50' + '15' }]}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{user.phoneNumber}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  nameText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginTop: 4,
  },
  labBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    gap: 6,
  },
  labBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#2196F3',
  },
  statsContainer: {
    marginBottom: 24,
    gap: 12,
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
