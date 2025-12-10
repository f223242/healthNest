import { colors, Fonts } from '@/constant/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface WelcomeHeaderProps {
  greeting?: string;
  name: string;
  subtitle?: string;
  avatar?: string | null;
  style?: ViewStyle;
  animation?: 'fadeIn' | 'fadeInDown' | 'slideInDown';
  showGradientBg?: boolean;
  whiteText?: boolean;
  rightAction?: React.ReactNode;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  greeting = 'Welcome back,',
  name,
  subtitle,
  avatar,
  style,
  animation = 'fadeInDown',
  showGradientBg = false,
  whiteText = false,
  rightAction,
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const Content = () => (
    <Animatable.View
      animation={animation}
      duration={600}
      useNativeDriver
      style={[styles.container, style]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.greeting, (showGradientBg || whiteText) && styles.whiteText]}>{greeting}</Text>
        <Text style={[styles.name, (showGradientBg || whiteText) && styles.whiteText]} numberOfLines={1}>{name}</Text>
        {subtitle && (
          <View style={[styles.subtitleBadge, (showGradientBg || whiteText) && styles.whiteBadge]}>
            <Text style={[styles.subtitle, (showGradientBg || whiteText) && styles.gradientSubtitle]}>{subtitle}</Text>
          </View>
        )}
      </View>

      <View style={[styles.avatarContainer, (showGradientBg || whiteText) && styles.whiteAvatarBorder]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={showGradientBg || whiteText ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] : [colors.primary, '#00D68F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarPlaceholder}
          >
            <Text style={styles.initials}>{getInitials(name)}</Text>
          </LinearGradient>
        )}
      </View>
      <View style={styles.rightContainer}>
        {rightAction && <View style={styles.rightActionWrap}>{rightAction}</View>}
      </View>
    </Animatable.View>
  );

  if (showGradientBg) {
    return (
      <LinearGradient
        colors={[colors.primary, '#00D68F'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientWrapper}
      >
        <Content />
      </LinearGradient>
    );
  }

  return <Content />;
};

const styles = StyleSheet.create({
  gradientWrapper: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  subtitleBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  whiteBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  gradientSubtitle: {
    color: colors.white,
  },
  whiteText: {
    color: 'rgba(255,255,255,0.95)',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  whiteAvatarBorder: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  rightContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionWrap: {
    marginLeft: 8,
  },
});

export default WelcomeHeader;
