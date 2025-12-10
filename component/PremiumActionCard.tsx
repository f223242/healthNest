import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface PremiumActionCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  onPress?: () => void;
  style?: ViewStyle;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInUp' | 'zoomIn' | 'fadeInRight';
  delay?: number;
  badge?: string | number;
  chevron?: boolean;
}

const PremiumActionCard: React.FC<PremiumActionCardProps> = ({
  title,
  subtitle,
  icon,
  color = colors.primary,
  gradient = false,
  gradientColors = [colors.primary, '#00D68F'] as const,
  onPress,
  style,
  animation = 'fadeInUp',
  delay = 0,
  badge,
  chevron = true,
}) => {
  return (
    <Animatable.View
      animation={animation}
      delay={delay}
      duration={500}
      useNativeDriver
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {gradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconContainer}
          >
            <Ionicons name={icon} size={22} color={colors.white} />
          </LinearGradient>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {badge && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        
        {chevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});

export default PremiumActionCard;
