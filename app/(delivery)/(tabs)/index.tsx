import NotificationIconWithBadge from '@/component/NotificationIconWithBadge';
import PremiumActionCard from '@/component/PremiumActionCard';
import SectionHeader from '@/component/SectionHeader';
import WelcomeHeader from '@/component/WelcomeHeader';
import { colors, Fonts } from '@/constant/theme';
import { DeliveryInfo, useAuthContext } from '@/hooks/useFirebaseAuth';
import AppointmentService, { Appointment } from '@/services/AppointmentService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeliveryDashboard = () => {
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const deliveryInfo = useMemo(() => {
    return user?.additionalInfo as DeliveryInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Delivery Partner';

  // Listen to appointments
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToDeliveryAppointments(
      user.uid,
      (fetchedAppointments) => {
        setAppointments(fetchedAppointments);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => ({
    pending: appointments.filter(a => a.status === "pending").length,
    active: appointments.filter(a => a.status === "accepted").length,
    completed: appointments.filter(a => a.status === "completed").length,
  }), [appointments]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const getVehicleIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
    switch (type?.toLowerCase()) {
      case 'motorcycle': return 'bicycle';
      case 'car': return 'car';
      case 'van': return 'bus';
      case 'bicycle': return 'bicycle';
      default: return 'car';
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00D68F'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <WelcomeHeader
          greeting="Welcome back,"
          name={fullName}
          subtitle={deliveryInfo?.vehicleType}
          avatar={deliveryInfo?.profileImage}
          rightAction={
            <NotificationIconWithBadge color={colors.white} />
          }
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}
            onPress={() => router.push('/(delivery)/(tabs)/requests')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FFE0B2' }]}>
              <Ionicons name="time" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => router.push('/(delivery)/(tabs)/requests')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#C8E6C9' }]}>
              <Ionicons name="bicycle" size={24} color="#4CAF50" />
            </View>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}
            onPress={() => router.push('/(delivery)/(tabs)/requests')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#BBDEFB' }]}>
              <Ionicons name="checkmark-done" size={24} color="#2196F3" />
            </View>
            <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Quick Action - Pending Requests Alert */}
        {stats.pending > 0 && (
          <Animatable.View animation="fadeInUp" delay={300}>
            <TouchableOpacity 
              style={styles.alertCard}
              onPress={() => router.push('/(delivery)/(tabs)/requests')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF9800', '#FF5722'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.alertGradient}
              >
                <View style={styles.alertContent}>
                  <View style={styles.alertIconContainer}>
                    <Ionicons name="notifications" size={28} color={colors.white} />
                  </View>
                  <View style={styles.alertTextContainer}>
                    <Text style={styles.alertTitle}>New Requests!</Text>
                    <Text style={styles.alertSubtitle}>
                      You have {stats.pending} pending delivery request{stats.pending > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.white} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            icon="flash"
            animation="fadeInUp"
            delay={400}
          />

          <PremiumActionCard
            title="View Requests"
            subtitle="Accept or reject delivery requests"
            icon="clipboard"
            gradient
            onPress={() => router.push('/(delivery)/(tabs)/requests')}
            animation="fadeInUp"
            delay={450}
          />

          <PremiumActionCard
            title="Customer Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            color="#9C27B0"
            onPress={() => router.push('/(delivery)/(tabs)/delivery-chats')}
            animation="fadeInUp"
            delay={500}
          />

          <PremiumActionCard
            title="Edit Profile"
            subtitle="Update your delivery information"
            icon="person"
            color="#2196F3"
            onPress={() => router.push('/(delivery)/edit-profile')}
            animation="fadeInUp"
            delay={550}
          />
        </View>

        {/* Tips Card */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsIconContainer}>
              <Ionicons name="bulb" size={24} color="#FF9800" />
            </View>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Pro Tip</Text>
              <Text style={styles.tipsText}>
                Respond quickly to delivery requests for better ratings and more customers!
              </Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: Fonts.bold,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginTop: 4,
  },
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertGradient: {
    padding: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  alertSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFECB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#F57C00',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#795548',
    lineHeight: 18,
  },
});
