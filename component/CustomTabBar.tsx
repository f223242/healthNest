import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled?: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

interface CustomTabBarProps extends BottomTabBarProps {
  tabs: TabItem[];
}

// Badge component
const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
};

// Animated Tab Item
const AnimatedTabItem = ({ 
  isFocused, 
  tabConfig, 
  onPress, 
  onLongPress,
  accessibilityLabel,
}: {
  isFocused: boolean;
  tabConfig: TabItem;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Only animate scale on click
    scale.value = withSpring(0.9, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    onPress();
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.tabContent, 
        animatedContainerStyle,
        { backgroundColor: isFocused ? colors.primary : 'transparent' }
      ]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isFocused ? (tabConfig.iconFilled || tabConfig.icon) : tabConfig.icon}
            size={20}
            color={isFocused ? colors.white : colors.gray}
          />
          {tabConfig.badge ? <TabBadge count={tabConfig.badge} /> : null}
        </View>
        {isFocused && (
          <Text style={styles.label} numberOfLines={1}>{tabConfig.label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  tabs,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = tabs.find((t) => t.name === route.name) || tabs[index];

          if (!tabConfig) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <AnimatedTabItem
              key={route.key}
              isFocused={isFocused}
              tabConfig={tabConfig}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            />
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
    minHeight: 40,
  },
  iconContainer: {
    position: "relative",
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    marginLeft: 2,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontFamily: Fonts.bold,
  },
});
