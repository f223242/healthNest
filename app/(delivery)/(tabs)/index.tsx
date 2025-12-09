import DashboardStatCard from '@/component/DashboardStatCard';
import QuickActionCard from '@/component/QuickActionCard';
import { colors, Fonts } from '@/constant/theme';
import { DeliveryInfo, useAuthContext } from '@/hooks/useFirebaseAuth';
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

const DeliveryDashboard = () => {
  const { user } = useAuthContext();
  
  // Get delivery info
  const deliveryInfo = useMemo(() => {
    return user?.additionalInfo as DeliveryInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Delivery Partner';

  // Get vehicle icon based on type
  const getVehicleIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'motorcycle': return 'bicycle';
      case 'car': return 'car';
      case 'van': return 'bus';
      case 'bicycle': return 'bicycle';
      default: return 'car';
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{fullName}</Text>
          {deliveryInfo?.vehicleType && (
            <View style={styles.vehicleBadge}>
              <Ionicons name={getVehicleIcon(deliveryInfo.vehicleType)} size={14} color="#FF5722" />
              <Text style={styles.vehicleText}>{deliveryInfo.vehicleType}</Text>
            </View>
          )}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <DashboardStatCard
            title="Vehicle Number"
            value={deliveryInfo?.vehicleNumber || '-'}
            icon="car"
            color={colors.primary}
          />
          <DashboardStatCard
            title="Availability"
            value={deliveryInfo?.availability || '-'}
            icon="time"
            color="#FF9800"
          />
          <DashboardStatCard
            title="License"
            value={deliveryInfo?.licenseNumber ? 'Verified' : 'Not Added'}
            icon="card"
            color="#4CAF50"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionCard
            title="Customer Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            color={colors.primary}
            onPress={() => router.push('/(delivery)/(tabs)/delivery-chats')}
          />
          <QuickActionCard
            title="Edit Profile"
            subtitle="Update your information"
            icon="person"
            color="#9C27B0"
            onPress={() => router.push('/(delivery)/edit-profile')}
          />
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          
          {deliveryInfo?.licenseNumber && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="card" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>License Number</Text>
                <Text style={styles.infoValue}>{deliveryInfo.licenseNumber}</Text>
              </View>
            </View>
          )}
          
          {deliveryInfo?.address && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: '#2196F3' + '15' }]}>
                <Ionicons name="location" size={20} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Home Address</Text>
                <Text style={styles.infoValue}>{deliveryInfo.city ? `${deliveryInfo.city}` : deliveryInfo.address}</Text>
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

export default DeliveryDashboard;

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
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    gap: 6,
  },
  vehicleText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#FF5722',
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
