import { BellIcon } from "@/assets/svg";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  notificationCount?: number;
  onNotificationPress?: () => void;

  title?: string;

  subtitle?: string;
 
  showGreeting?: boolean;
  rightAction?: React.ReactNode;
  /** Show the notification bell (when `rightAction` is not provided). Default: false */
  showNotification?: boolean;
  /** Optional left-side action (e.g., icon). Rendered left of the title. */
  leftAction?: React.ReactNode;
  /** Profile image URL - when provided, shows circular image on left side */
  profileImage?: string;
  /** Callback when profile image is pressed */
  onProfilePress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  notificationCount = 3, 
  onNotificationPress,
  title,
  subtitle,
  showGreeting = true,
  rightAction,
  showNotification = false,
  leftAction,
  profileImage,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  const renderLeftContent = () => {
    if (profileImage) {
      return (
        <TouchableOpacity 
          style={styles.profileImageContainer} 
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
    if (leftAction) {
      return <View style={styles.leftActionContainer}>{leftAction}</View>;
    }
    return null;
  };

  return (
    <LinearGradient
      colors={[colors.primary, "#00B976", "#00D68F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.container}>
        {renderLeftContent()}

        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{showGreeting && !title ? `${greeting}!` : title || greeting}</Text>
          <Text style={styles.subtitle}>{subtitle ?? "How can we help you today?"}</Text>
        </View>

        {rightAction ? (
          <View>{rightAction}</View>
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <BellIcon width={24} height={24} color={colors.white} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 20,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  leftActionContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileImageContainer: {
    marginRight: 14,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
    lineHeight: 12,
  },
});
