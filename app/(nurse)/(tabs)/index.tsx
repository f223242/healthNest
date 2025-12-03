import DashboardStatCard from '@/component/DashboardStatCard';
import QuickActionCard from '@/component/QuickActionCard';
import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
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

const NurseDashboard = () => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
    
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
     

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <DashboardStatCard
            title="Total Patients"
            value="24"
            icon="people"
            color={colors.primary}
            trend="+12%"
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
            onPress={() => router.push('/nurse-chat-detail')}
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
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
