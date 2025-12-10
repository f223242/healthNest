import LogoutModal from "@/component/ModalComponent/LogoutModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const router=useRouter();
  const toast = useToast();
  const { logout, user } = useAuthContext();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get admin info from context
  const adminInfo = useMemo(() => {
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Admin User";
    const email = user?.email || "admin@healthnest.com";
    const profileImage = user?.additionalInfo?.profileImage || null;
    
    return { fullName, email, profileImage };
  }, [user]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      toast.show({
        type: firebaseMessages.logoutSuccess.type as any,
        text1: firebaseMessages.logoutSuccess.text1,
        text2: firebaseMessages.logoutSuccess.text2,
      });
    } catch (error: any) {
      toast.show({
        type: error.type || 'error',
        text1: error.text1 || 'Logout Failed',
        text2: error.text2 || error.message || "Logout failed. Please try again.",
      });
    }
  };

  const settingSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: "mail" as const,
          label: "Email Notifications",
          description: "Receive email alerts for important events",
          type: "switch" as const,
          value: emailNotifications,
          onValueChange: setEmailNotifications,
        },
        {
          icon: "notifications" as const,
          label: "Push Notifications",
          description: "Receive push notifications",
          type: "switch" as const,
          value: pushNotifications,
          onValueChange: setPushNotifications,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "person" as const,
          label: "Admin Profile",
          description: "View and edit your profile",
          type: "navigation" as const,
          onPress: () => {router.push('/(admin)/edit-profile')},
        },
        {
          icon: "key" as const,
          label: "Change Password",
          description: "Update your password",
          type: "navigation" as const,
          onPress: () => {router.push('/(admin)/change-password')},
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "information-circle" as const,
          label: "About",
          description: "App version and information",
          type: "navigation" as const,
          onPress: () => {router.push('/(admin)/about')},
        },
      ],
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#1E293B', '#334155', '#475569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          
          {/* Admin Info in Header */}
          <View style={styles.headerProfileSection}>
            {adminInfo.profileImage ? (
              <Image
                source={{ uri: adminInfo.profileImage }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="shield" size={28} color="#1E293B" />
              </View>
            )}
            <View style={styles.headerProfileInfo}>
              <Text style={styles.headerName}>{adminInfo.fullName}</Text>
              <Text style={styles.headerEmail}>{adminInfo.email}</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.white} />
                <Text style={styles.headerBadgeText}>ADMIN</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast,
                  ]}
                  onPress={item.type === "navigation" ? item.onPress : undefined}
                  activeOpacity={item.type === "navigation" ? 0.6 : 1}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  {item.type === "switch" ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: "#D1D5DB", true: colors.primary + "80" }}
                      thumbColor={item.value ? colors.primary : "#F3F4F6"}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>HealthNest Admin v1.0.0</Text>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1E293B',
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: sizes.paddingHorizontal,
  },

  headerContent: {
    width: '100%',
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 20,
  },

  headerProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.white,
  },

  headerAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  headerProfileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  headerName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },

  headerEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },

  headerBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    letterSpacing: 0.5,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  versionText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
  },
});
