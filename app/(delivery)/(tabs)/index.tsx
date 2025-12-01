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

// Simple stat card for chat-based stats
interface ChatStatProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ChatStat: React.FC<ChatStatProps> = ({ title, value, icon, color }) => (
  <View style={[styles.chatStatCard, { borderLeftColor: color }]}>
    <View style={[styles.chatStatIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View>
      <Text style={styles.chatStatValue}>{value}</Text>
      <Text style={styles.chatStatTitle}>{title}</Text>
    </View>
  </View>
);

const DeliveryDashboard = () => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Chat Stats - Only Active Chats and Unread */}
        <View style={styles.statsRow}>
          <ChatStat title="Active Chats" value="5" icon="chatbubbles" color={colors.primary} />
          <ChatStat title="Unread" value="3" icon="mail-unread" color={colors.primary} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(delivery)/(tabs)/delivery-chats')}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="chatbubbles" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Chats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(delivery)/(tabs)/profile')}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={28} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chat-Based System</Text>
            <Text style={styles.infoDescription}>
              Use the Chats tab to communicate with customers about their deliveries. All order updates and inquiries can be handled through chat.
            </Text>
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
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  chatStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 12,
  },
  chatStatIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatStatValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  chatStatTitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 14,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 14,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
});
