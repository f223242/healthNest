import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: string;
  containerStyle?: ViewStyle;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  containerStyle,
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }, containerStyle]}>
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

export default DashboardStatCard;

const styles = StyleSheet.create({
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
});
