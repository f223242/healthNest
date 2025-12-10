import { colors, Fonts } from '@/constant/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInUp' | 'zoomIn';
  delay?: number;
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  title,
  subtitle,
  animation = 'fadeInUp',
  delay = 0,
  gradient = false,
  gradientColors = [colors.primary, '#00D68F'] as const,
}) => {
  const CardWrapper = gradient ? LinearGradient : View;
  const wrapperProps = gradient 
    ? { colors: gradientColors, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    : {};

  return (
    <Animatable.View
      animation={animation}
      delay={delay}
      duration={600}
      useNativeDriver
    >
      <CardWrapper 
        {...wrapperProps as any}
        style={[styles.card, gradient && styles.gradientCard, style]}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={[styles.title, gradient && styles.whiteText]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, gradient && styles.whiteSubtitle]}>{subtitle}</Text>}
          </View>
        )}
        {children}
      </CardWrapper>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  gradientCard: {
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  whiteText: {
    color: colors.white,
  },
  whiteSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
});

export default GlassCard;
