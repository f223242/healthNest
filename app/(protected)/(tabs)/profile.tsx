import LogoutModal from "@/component/ModalComponent/LogoutModal";
import ProfileOptions from "@/component/ProfileOptions";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { PatientInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");


const Profile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Extract user info
  const userInfo = useMemo(() => {
    const additionalInfo = user?.additionalInfo as PatientInfo | undefined;
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "User";
    const profileImage = additionalInfo?.profileImage || null;
    const role = user?.role?.toUpperCase() || "PATIENT";
    const email = user?.email || "user@healthnest.com";
    const bloodGroup = additionalInfo?.bloodGroup || null;
    const address = additionalInfo?.address || null;
    const city = additionalInfo?.city || null;

    return {
      fullName,
      firstName,
      lastName,
      profileImage,
      role,
      email,
      bloodGroup,
      address,
      city,
    };
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
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header with Profile */}
      <LinearGradient
        colors={[colors.primary, "#00D68F", "#00B37A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
            {userInfo.profileImage ? (
              <Image
                source={{ uri: userInfo.profileImage }}
                style={styles.headerProfileImage}
              />
            ) : (
              <View style={styles.headerProfilePlaceholder}>
                <Ionicons name="person" size={40} color={colors.white} />
              </View>
            )}
            <Text style={styles.headerName}>{userInfo.fullName}</Text>
            <Text style={styles.headerEmail}>{userInfo.email}</Text>
            <View style={styles.headerBadgesRow}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{userInfo.role === "USER" ? "PATIENT" : userInfo.role}</Text>
              </View>
              {userInfo.bloodGroup && (
                <View style={[styles.headerBadge, styles.headerBadgeSecondary]}>
                  <Text style={styles.headerBadgeText}>{userInfo.bloodGroup}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Info Section */}
          {(userInfo.address || userInfo.city) && (
            <Animated.View style={[styles.quickInfoCard, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}>
              <View style={styles.quickInfoItem}>
                <View style={styles.quickInfoIconContainer}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                </View>
                <Text style={styles.quickInfoText} numberOfLines={2}>
                  {userInfo.address}{userInfo.city ? `, ${userInfo.city}` : ""}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Account Settings Section */}
          <Animated.View style={[styles.section, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.sectionContent}>
              <ProfileOptions
                leftIcon={<Ionicons name="person-outline" size={22} color={colors.primary} />}
                title="Edit Profile"
                description="Update information"
                onPress={() => router.push("/(protected)/edit-profile")}
              />
              <ProfileOptions
                leftIcon={<Ionicons name="lock-closed-outline" size={22} color={colors.primary} />}
                title="Change Password"
                description="Update your account password"
                onPress={() => router.push("/(protected)/change-password")}
                showBorder={false}
              />
            </View>
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View style={[styles.section, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionContent}>
              <ProfileOptions
                leftIcon={<Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />}
                title="AI Assistant"
                description="Chat with AI health assistant"
                onPress={() => router.push("/(protected)/general-chat")}
              />
              <ProfileOptions
                leftIcon={<Ionicons name="notifications-outline" size={22} color={colors.primary} />}
                title="Notifications"
                description="Manage notification preferences"
                onPress={() => router.push("/(protected)/notifications")}
              />
              <ProfileOptions
                leftIcon={<Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />}
                title="Privacy & Security"
                description="Control your privacy settings"
                onPress={() => router.push("/(protected)/privacy")}
                showBorder={false}
              />
            </View>
          </Animated.View>

          {/* Support Section */}
          <Animated.View style={[styles.section, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionContent}>
              <ProfileOptions
                leftIcon={<Ionicons name="chatbox-ellipses-outline" size={22} color={colors.primary} />}
                title="Complain to Admin"
                description="Report issues or concerns"
                onPress={() => router.push("/(protected)/complain")}
                showBorder={false}
              />
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.danger, "#FF6B6B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutButtonGradient}
              >
                <Ionicons name="log-out" size={20} color={colors.white} />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Logout Modal */}
        <LogoutModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />
      </SafeAreaView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    elevation: 8,
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerProfileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  headerProfilePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 12,
  },
  headerEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  headerBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  headerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerBadgeSecondary: {
    backgroundColor: "rgba(255, 100, 100, 0.3)",
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 120,
  },
  quickInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickInfoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  quickInfoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
});
