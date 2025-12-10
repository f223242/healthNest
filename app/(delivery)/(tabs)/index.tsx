import PremiumActionCard from '@/component/PremiumActionCard';
import SectionHeader from '@/component/SectionHeader';
import WelcomeHeader from '@/component/WelcomeHeader';
import { colors, Fonts } from '@/constant/theme';
import { DeliveryInfo, useAuthContext } from '@/hooks/useFirebaseAuth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
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

  const deliveryInfo = useMemo(() => {
    return user?.additionalInfo as DeliveryInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Delivery Partner';

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
        />

      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Today's Overview Card */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <LinearGradient
            colors={['#11998e', '#38ef7d'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewCard}
          >
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>Ready to Deliver!</Text>
              <Text style={styles.overviewSubtitle}>
                Check your customer chats for new delivery requests and updates.
              </Text>
              <TouchableOpacity
                style={styles.overviewButton}
                onPress={() => router.push('/(delivery)/(tabs)/delivery-chats')}
              >
                <Text style={styles.overviewButtonText}>View Chats</Text>
                <Ionicons name="arrow-forward" size={16} color="#11998e" />
              </TouchableOpacity>
            </View>
            <View style={styles.overviewIconContainer}>
              <Ionicons name="bicycle" size={80} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            icon="flash"
            animation="fadeInUp"
            delay={300}
          />

          <PremiumActionCard
            title="Customer Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            gradient
            onPress={() => router.push('/(delivery)/(tabs)/delivery-chats')}
            animation="fadeInUp"
            delay={350}
          />

          <PremiumActionCard
            title="Edit Profile"
            subtitle="Update your delivery information"
            icon="person"
            color="#9C27B0"
            onPress={() => router.push('/(delivery)/edit-profile')}
            animation="fadeInUp"
            delay={400}
          />

          <PremiumActionCard
            title="Help & Support"
            subtitle="Get assistance when you need it"
            icon="help-circle"
            color="#2196F3"
            onPress={() => router.push('/(delivery)/help')}
            animation="fadeInUp"
            delay={450}
          />
        </View>



        {/* Tips Card */}
        <Animatable.View animation="fadeInUp" delay={650} style={styles.section}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsIconContainer}>
              <Ionicons name="bulb" size={24} color="#FF9800" />
            </View>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Pro Tip</Text>
              <Text style={styles.tipsText}>
                Keep your vehicle documents updated and respond quickly to customer chats for better ratings.
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
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    elevation: 8,
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
  headerStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerStatValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
    textAlign: 'center',
  },
  headerStatLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
    marginTop: -15,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 6,
  },
  overviewButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#11998e',
  },
  overviewIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
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
