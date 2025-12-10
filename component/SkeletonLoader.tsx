import { colors } from '@/constant/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'stats' | 'profile' | 'custom';
  count?: number;
  style?: ViewStyle;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  style,
}) => {
  const renderCard = (index: number) => (
    <View key={index} style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <ShimmerPlaceholder style={styles.cardIcon} shimmerColors={shimmerColors} />
        <View style={styles.cardHeaderText}>
          <ShimmerPlaceholder style={styles.cardTitle} shimmerColors={shimmerColors} />
          <ShimmerPlaceholder style={styles.cardSubtitle} shimmerColors={shimmerColors} />
        </View>
      </View>
      <ShimmerPlaceholder style={styles.cardBody} shimmerColors={shimmerColors} />
    </View>
  );

  const renderListItem = (index: number) => (
    <View key={index} style={[styles.listItem, style]}>
      <ShimmerPlaceholder style={styles.listAvatar} shimmerColors={shimmerColors} />
      <View style={styles.listContent}>
        <ShimmerPlaceholder style={styles.listTitle} shimmerColors={shimmerColors} />
        <ShimmerPlaceholder style={styles.listSubtitle} shimmerColors={shimmerColors} />
      </View>
      <ShimmerPlaceholder style={styles.listAction} shimmerColors={shimmerColors} />
    </View>
  );

  const renderStats = (index: number) => (
    <View key={index} style={[styles.statCard, style]}>
      <ShimmerPlaceholder style={styles.statIcon} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.statValue} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.statLabel} shimmerColors={shimmerColors} />
    </View>
  );

  const renderProfile = () => (
    <View style={[styles.profileContainer, style]}>
      <ShimmerPlaceholder style={styles.profileAvatar} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.profileName} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.profileEmail} shimmerColors={shimmerColors} />
      <View style={styles.profileStats}>
        {[1, 2, 3].map((i) => (
          <ShimmerPlaceholder key={i} style={styles.profileStat} shimmerColors={shimmerColors} />
        ))}
      </View>
    </View>
  );

  const items = Array.from({ length: count }, (_, i) => i);

  switch (type) {
    case 'list':
      return <View style={styles.container}>{items.map(renderListItem)}</View>;
    case 'stats':
      return <View style={styles.statsContainer}>{items.map(renderStats)}</View>;
    case 'profile':
      return renderProfile();
    default:
      return <View style={styles.container}>{items.map(renderCard)}</View>;
  }
};

const shimmerColors = ['#f5f5f5', '#eeeeee', '#f5f5f5'];

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  cardTitle: {
    width: '70%',
    height: 16,
    borderRadius: 8,
  },
  cardSubtitle: {
    width: '50%',
    height: 12,
    borderRadius: 6,
  },
  cardBody: {
    width: '100%',
    height: 60,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  listContent: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  listTitle: {
    width: '60%',
    height: 14,
    borderRadius: 7,
  },
  listSubtitle: {
    width: '40%',
    height: 10,
    borderRadius: 5,
  },
  listAction: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginBottom: 16,
  },
  statValue: {
    width: '60%',
    height: 28,
    borderRadius: 8,
    marginBottom: 8,
  },
  statLabel: {
    width: '80%',
    height: 12,
    borderRadius: 6,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    width: 150,
    height: 22,
    borderRadius: 11,
    marginBottom: 8,
  },
  profileEmail: {
    width: 200,
    height: 14,
    borderRadius: 7,
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 16,
  },
  profileStat: {
    width: 80,
    height: 60,
    borderRadius: 12,
  },
});

export default SkeletonLoader;
