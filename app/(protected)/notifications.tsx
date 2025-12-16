import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import NotificationService, { Notification } from "@/services/NotificationService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";
import * as Animatable from 'react-native-animatable';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const NotificationsScreen = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to notifications
    const unsubscribe = NotificationService.listenToNotifications(
      user.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await NotificationService.clearAllNotifications(user.uid);
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  const handleItemPress = async (item: Notification) => {
    if (!item.read) {
      await NotificationService.markAsRead(item.id);
    }
    // Navigate based on type if needed
    if (item.type === 'appointment') {
      router.push("/(protected)/(tabs)/appointment");
    } else if (item.type === 'message') {
      // If we had conversation ID we could navigate
      // router.push(...)
    }
  };

  const renderRightActions = (progress: any, dragX: any, id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(id)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }: { item: Notification; index: number }) => {
    const isAppointment = item.type === 'appointment';
    const iconName = isAppointment
      ? "calendar"
      : item.type === 'message'
        ? "chatbubble"
        : item.type === 'order'
          ? "medkit"
          : "notifications";

    const iconColor = isAppointment
      ? "#FF9800"
      : item.type === 'message'
        ? "#2196F3"
        : item.type === 'order'
          ? "#4CAF50"
          : colors.primary;

    return (
      <Swipeable
        renderRightActions={(p, d) => renderRightActions(p, d, item.id)}
        rightThreshold={40}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleItemPress(item)}
        >
          <Animatable.View
            animation="fadeInUp"
            delay={index * 50}
            style={[
              styles.notificationCard,
              !item.read && styles.unreadCard
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                <Text style={styles.time}>
                  {item.timestamp ? new Date(item.timestamp.toMillis()).toLocaleDateString() : ''}
                </Text>
              </View>
              <Text style={[styles.body, !item.read && styles.unreadBody]} numberOfLines={2}>{item.body}</Text>
            </View>
          </Animatable.View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, '#00C853']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>


    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  clearButtonText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.gray,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    paddingHorizontal: sizes.paddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  time: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginLeft: 8,
  },
  body: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
  unreadBody: {
    color: colors.text,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginTop: 4,
  },
});
