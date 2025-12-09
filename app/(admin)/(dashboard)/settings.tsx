import LogoutModal from "@/component/ModalComponent/LogoutModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Image,
    ScrollView,
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Info Card */}
        <View style={styles.adminCard}>
          {adminInfo.profileImage ? (
            <Image
              source={{ uri: adminInfo.profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color={colors.white} />
            </View>
          )}
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{adminInfo.fullName}</Text>
            <Text style={styles.adminEmail}>{adminInfo.email}</Text>
          </View>
        </View>

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
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  adminCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
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
