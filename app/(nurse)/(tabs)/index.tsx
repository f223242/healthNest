import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {trend && (
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={12} color={colors.success} />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
}) => (
  <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={[color, color + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickActionGradient}
    >
      <Ionicons name={icon} size={28} color={colors.white} />
      <View style={styles.quickActionText}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.white} />
    </LinearGradient>
  </TouchableOpacity>
);

const NurseDashboard = () => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
    
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
     

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Patients"
            value="24"
            icon="people"
            color={colors.primary}
            trend="+12%"
          />
          <StatCard
            title="Appointments Today"
            value="8"
            icon="calendar"
            color="#2196F3"
            trend="+5"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickAction
            title="Patient Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            color={colors.primary}
            onPress={() => router.push('/nurse-chat-detail')}
          />
          <QuickAction
            title="Today's Schedule"
            subtitle="Check appointments"
            icon="calendar-outline"
            color="#2196F3"
            onPress={() => {}}
          />
          <QuickAction
            title="Patient Records"
            subtitle="Access medical records"
            icon="document-text-outline"
            color="#9C27B0"
            onPress={() => {}}
          />
          <QuickAction
            title="Emergency Contacts"
            subtitle="Quick access to contacts"
            icon="call-outline"
            color="#FF5722"
            onPress={() => {}}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {[
              {
                icon: 'chatbubble-ellipses',
                color: colors.primary,
                title: 'New message from John Smith',
                time: '5 min ago',
              },
              {
                icon: 'checkmark-done',
                color: colors.success,
                title: 'Completed visit with Emma Watson',
                time: '1 hour ago',
              },
              {
                icon: 'calendar',
                color: '#2196F3',
                title: 'Upcoming appointment at 3:00 PM',
                time: '2 hours',
              },
              {
                icon: 'document-text',
                color: '#9C27B0',
                title: 'Updated medical record',
                time: '3 hours ago',
              },
            ].map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: activity.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={activity.icon as any}
                    size={20}
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
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
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    marginRight: 16,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.success,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.white,
    opacity: 0.9,
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
  },
});
