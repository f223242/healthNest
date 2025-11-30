import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useContext';
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

const DeliveryDashboard = () => {
  const { user, logout } = useAuthContext();
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#FF5722', '#FF5722' + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Welcome Back 👋</Text>
              <Text style={styles.userName}>Ahmed Ali</Text>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="time-outline" size={14} color={colors.white + 'CC'} />
                <Text style={styles.dateTimeText}>{currentDate} • {currentTime}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications" size={24} color={colors.white} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>5</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Deliveries"
            value="18"
            icon="bicycle"
            color={colors.primary}
            trend="+8%"
          />
          <StatCard
            title="Active Orders"
            value="3"
            icon="cube"
            color="#FF5722"
          />
          <StatCard
            title="Completed Today"
            value="15"
            icon="checkmark-done-circle"
            color={colors.success}
            trend="+3"
          />
          <StatCard
            title="Today's Earnings"
            value="Rs 4.5K"
            icon="cash"
            color="#FFC107"
            trend="+15%"
          />
        </View>

        {/* Active Orders */}
        <View style={styles.scheduleContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderIdContainer}>
                <Ionicons name="cube-outline" size={16} color={colors.primary} />
                <Text style={styles.orderId}>#ORD-2451</Text>
              </View>
              <View style={[styles.orderStatusBadge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="bicycle" size={12} color={colors.primary} />
                <Text style={[styles.orderStatusText, { color: colors.primary }]}>In Transit</Text>
              </View>
            </View>
            <Text style={styles.orderCustomer}>Ali Hassan</Text>
            <View style={styles.orderLocation}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={styles.orderAddress}>Gulberg III, Block A, Lahore</Text>
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.orderAmount}>Rs 850</Text>
              <TouchableOpacity style={styles.orderActionButton}>
                <Text style={styles.orderActionText}>Navigate</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderIdContainer}>
                <Ionicons name="cube-outline" size={16} color="#FF9800" />
                <Text style={styles.orderId}>#ORD-2452</Text>
              </View>
              <View style={[styles.orderStatusBadge, { backgroundColor: '#FF9800' + '20' }]}>
                <Ionicons name="time" size={12} color="#FF9800" />
                <Text style={[styles.orderStatusText, { color: '#FF9800' }]}>Pending</Text>
              </View>
            </View>
            <Text style={styles.orderCustomer}>Fatima Khan</Text>
            <View style={styles.orderLocation}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={styles.orderAddress}>Model Town, Lahore</Text>
            </View>
            <View style={styles.orderFooter}>
              <Text style={styles.orderAmount}>Rs 1,200</Text>
              <TouchableOpacity style={[styles.orderActionButton, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.orderActionText}>Accept</Text>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickAction
            title="Customer Chats"
            subtitle="View and respond to messages"
            icon="chatbubbles"
            color={colors.primary}
            onPress={() => router.push('/(delivery)/delivery-chats')}
          />
          <QuickAction
            title="Active Deliveries"
            subtitle="Track ongoing orders"
            icon="location-outline"
            color="#FF5722"
            onPress={() => {}}
          />
          <QuickAction
            title="Delivery History"
            subtitle="View past deliveries"
            icon="time-outline"
            color="#2196F3"
            onPress={() => {}}
          />
          <QuickAction
            title="Earnings Report"
            subtitle="Check your earnings"
            icon="stats-chart-outline"
            color="#FFC107"
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
                title: 'New message from Ali Hassan',
                time: '2 min ago',
              },
              {
                icon: 'checkmark-done',
                color: colors.success,
                title: 'Delivered order to Fatima Khan',
                time: '30 min ago',
              },
              {
                icon: 'cube',
                color: '#FF5722',
                title: 'New order assigned',
                time: '1 hour ago',
              },
              {
                icon: 'cash',
                color: '#FFC107',
                title: 'Payment received Rs 850',
                time: '2 hours ago',
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

export default DeliveryDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white + 'CC',
  },
  userName: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 4,
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.white + 'CC',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 24,
    gap: 12,
  },
  scheduleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  orderCustomer: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  orderLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  orderAddress: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray + '50',
  },
  orderAmount: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  orderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  orderActionText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
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
  statsGrid: {
    gap: 12,
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
