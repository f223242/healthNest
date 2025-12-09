import DashboardStatCard from '@/component/DashboardStatCard';
import QuickActionCard from '@/component/QuickActionCard';
import { colors, Fonts } from '@/constant/theme';
import { NurseInfo, useAuthContext } from '@/hooks/useFirebaseAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NurseDashboard = () => {
  const { user } = useAuthContext();
  
  // Get nurse info
  const nurseInfo = useMemo(() => {
    return user?.additionalInfo as NurseInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Nurse';

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
    
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{fullName}</Text>
          {nurseInfo?.specialization && (
            <View style={styles.specBadge}>
              <Ionicons name="medical" size={14} color={colors.primary} />
              <Text style={styles.specText}>{nurseInfo.specialization}</Text>
            </View>
          )}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <DashboardStatCard
            title="Experience"
            value={nurseInfo?.experience || '-'}
            icon="time"
            color={colors.primary}
          />
          <DashboardStatCard
            title="Hourly Rate"
            value={nurseInfo?.hourlyRate ? `Rs. ${nurseInfo.hourlyRate}` : '-'}
            icon="cash"
            color="#FF9800"
          />
          <DashboardStatCard
            title="Availability"
            value={nurseInfo?.availability || '-'}
            icon="calendar"
            color="#2196F3"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionCard
            title="Patient Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            color={colors.primary}
            onPress={() => router.push('/(nurse)/(tabs)/nurse-chats')}
          />
          <QuickActionCard
            title="Edit Profile"
            subtitle="Update your information"
            icon="person"
            color="#9C27B0"
            onPress={() => router.push('/(nurse)/edit-profile')}
          />
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          
          {nurseInfo?.certifications && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="ribbon" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Certifications</Text>
                <Text style={styles.infoValue}>{nurseInfo.certifications}</Text>
              </View>
            </View>
          )}
          
          {nurseInfo?.address && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#2196F3' + '15' }]}>
                <Ionicons name="location" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service Area</Text>
                <Text style={styles.infoValue}>{nurseInfo.city ? `${nurseInfo.city}` : nurseInfo.address}</Text>
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

export default NurseDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  welcomeSection: {
    paddingHorizontal: 20,
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
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    gap: 6,
  },
  specText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  statsContainer: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoSection: {
    paddingHorizontal: 20,
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
