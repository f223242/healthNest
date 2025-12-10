import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  onPress?: () => void;
  style?: ViewStyle;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInUp' | 'zoomIn' | 'bounceIn';
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const PremiumStatCard: React.FC<PremiumStatCardProps> = ({
  title,
  value,
  icon,
  color = colors.primary,
  gradient = false,
  gradientColors = [colors.primary, '#00D68F'] as const,
  onPress,
  style,
  animation = 'fadeInUp',
  delay = 0,
  trend,
  trendValue,
}) => {
  const CardContent = () => (
    <>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : color + '15' }]}>
          <Ionicons name={icon} size={22} color={gradient ? colors.white : color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? '#E8F5E9' : trend === 'down' ? '#FFEBEE' : '#F5F5F5' }]}>
            <Ionicons 
              name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
              size={12} 
              color={trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#9E9E9E'} 
            />
            {trendValue && (
              <Text style={[styles.trendText, { color: trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#9E9E9E' }]}>
                {trendValue}
              </Text>
            )}
          </View>
        )}
      </View>
      <Text style={[styles.value, gradient && styles.whiteText]}>{value}</Text>
      <Text style={[styles.title, gradient && styles.whiteSubtitle]}>{title}</Text>
    </>
  );

  const CardWrapper = gradient ? LinearGradient : View;
  const wrapperProps = gradient 
    ? { colors: gradientColors, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    : {};

  return (
    <Animatable.View
      animation={animation}
      delay={delay}
      duration={500}
      useNativeDriver
    >
      <TouchableOpacity 
        activeOpacity={onPress ? 0.8 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <CardWrapper
          {...wrapperProps as any}
          style={[styles.card, gradient && styles.gradientCard, style]}
        >
          <CardContent />
        </CardWrapper>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minWidth: '48%',
  },
  gradientCard: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  value: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  whiteText: {
    color: colors.white,
  },
  whiteSubtitle: {
    color: 'rgba(255,255,255,0.85)',
  },
});

export default PremiumStatCard;
