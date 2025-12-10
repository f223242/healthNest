import PremiumActionCard from '@/component/PremiumActionCard';
import PremiumStatCard from '@/component/PremiumStatCard';
import SectionHeader from '@/component/SectionHeader';
import WelcomeHeader from '@/component/WelcomeHeader';
import { colors, Fonts } from '@/constant/theme';
import { NurseInfo, useAuthContext } from '@/hooks/useFirebaseAuth';
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

const NurseDashboard = () => {
  const { user } = useAuthContext();
  
  const nurseInfo = useMemo(() => {
    return user?.additionalInfo as NurseInfo | undefined;
  }, [user]);

  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Nurse';

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
          subtitle={nurseInfo?.specialization}
          avatar={nurseInfo?.profileImage}
        />

        {/* Quick Stats in Header */}
        <View style={styles.headerStats}>
          <Animatable.View animation="fadeInUp" delay={100} style={styles.headerStatItem}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="time-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>{nurseInfo?.experience || '-'}</Text>
            <Text style={styles.headerStatLabel}>Experience</Text>
          </Animatable.View>
          
          <View style={styles.headerStatDivider} />
          
          <Animatable.View animation="fadeInUp" delay={200} style={styles.headerStatItem}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="cash-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>Rs. {nurseInfo?.hourlyRate || '-'}</Text>
            <Text style={styles.headerStatLabel}>Per Hour</Text>
          </Animatable.View>
          
          <View style={styles.headerStatDivider} />
          
          <Animatable.View animation="fadeInUp" delay={300} style={styles.headerStatItem}>
            <View style={styles.headerStatIcon}>
              <Ionicons name="calendar-outline" size={18} color={colors.white} />
            </View>
            <Text style={styles.headerStatValue}>{nurseInfo?.availability || '-'}</Text>
            <Text style={styles.headerStatLabel}>Availability</Text>
          </Animatable.View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Today's Overview Card */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <LinearGradient
            colors={['#667eea', '#764ba2'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewCard}
          >
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>Ready to Help!</Text>
              <Text style={styles.overviewSubtitle}>
                You have patients waiting for your care. Check your chats to respond.
              </Text>
              <TouchableOpacity 
                style={styles.overviewButton}
                onPress={() => router.push('/(nurse)/(tabs)/nurse-chats')}
              >
                <Text style={styles.overviewButtonText}>View Chats</Text>
                <Ionicons name="arrow-forward" size={16} color="#764ba2" />
              </TouchableOpacity>
            </View>
            <View style={styles.overviewIconContainer}>
              <Ionicons name="heart-circle" size={80} color="rgba(255,255,255,0.2)" />
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
            title="Patient Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            gradient
            onPress={() => router.push('/(nurse)/(tabs)/nurse-chats')}
            animation="fadeInUp"
            delay={350}
          />
          
          <PremiumActionCard
            title="Edit Profile"
            subtitle="Update your professional information"
            icon="person"
            color="#9C27B0"
            onPress={() => router.push('/(nurse)/edit-profile')}
            animation="fadeInUp"
            delay={400}
          />
          
          <PremiumActionCard
            title="Help & Support"
            subtitle="Get assistance when you need it"
            icon="help-circle"
            color="#2196F3"
            onPress={() => router.push('/(nurse)/help')}
            animation="fadeInUp"
            delay={450}
          />
        </View>

        {/* Service Stats */}
        <View style={styles.section}>
          <SectionHeader 
            title="Your Stats" 
            icon="bar-chart"
            animation="fadeInUp"
            delay={500}
          />
          
          <View style={styles.statsGrid}>
            <PremiumStatCard
              title="Certifications"
              value={nurseInfo?.certifications ? '✓' : '-'}
              icon="ribbon"
              color="#4CAF50"
              animation="fadeInUp"
              delay={550}
              style={styles.statCard}
            />
            <PremiumStatCard
              title="Service Area"
              value={nurseInfo?.city || 'N/A'}
              icon="location"
              color="#2196F3"
              animation="fadeInUp"
              delay={600}
              style={styles.statCard}
            />
          </View>
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
                Keep your profile updated with your latest certifications to attract more patients.
              </Text>
            </View>
          </View>
        </Animatable.View>
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
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    color: '#764ba2',
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
