import LogoutModal from "@/component/ModalComponent/LogoutModal";
import ProfileOptions from "@/component/ProfileOptions";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthContext();
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

  // Extract lab info from additionalInfo
  const labInfo = useMemo(() => {
    const additionalInfo = user?.additionalInfo as LabInfo | undefined;
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "Lab Technician";
    const profileImage = additionalInfo?.profileImage || null;
    const email = user?.email || "lab@healthnest.com";
    const labName = additionalInfo?.labName || null;
    const licenseNumber = additionalInfo?.licenseNumber || null;
    const operatingHours = additionalInfo?.operatingHours || null;
    const servicesOffered = additionalInfo?.servicesOffered || null;
    const homeSampling = additionalInfo?.homeSampling || false;
    const address = additionalInfo?.address || null;
    const city = additionalInfo?.city || null;

    return {
      fullName,
      firstName,
      lastName,
      profileImage,
      email,
      labName,
      licenseNumber,
      operatingHours,
      servicesOffered,
      homeSampling,
      address,
      city,
    };
  }, [user]);

  const handleLogout = () => setShowLogoutModal(true);
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

      <LinearGradient
        colors={[colors.primary, '#00B976', '#00D68F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Lab Profile</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/(lab)/edit-profile")}
            >
              <Ionicons name="settings-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar in Header */}
          <View style={styles.headerProfileSection}>
            {labInfo.profileImage ? (
              <Image
                source={{ uri: labInfo.profileImage }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="flask" size={36} color={colors.primary} />
              </View>
            )}
            <View style={styles.headerProfileInfo}>
              <Text style={styles.headerName}>{labInfo.labName || labInfo.fullName}</Text>
              <Text style={styles.headerEmail}>{labInfo.email}</Text>
              <View style={styles.headerBadges}>
                <View style={styles.headerBadge}>
                  <Ionicons name="flask" size={12} color={colors.white} />
                  <Text style={styles.headerBadgeText}>LAB</Text>
                </View>
                {labInfo.homeSampling && (
                  <View style={[styles.headerBadge, { backgroundColor: 'rgba(0,200,150,0.3)' }]}>
                    <Ionicons name="home" size={12} color={colors.white} />
                    <Text style={styles.headerBadgeText}>Home Sampling</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Quick Info Section */}
            {(labInfo.operatingHours || labInfo.licenseNumber || labInfo.servicesOffered) && (
              <View style={styles.quickInfoCard}>
                {labInfo.licenseNumber && (
                  <View style={styles.quickInfoItem}>
                    <Ionicons name="card-outline" size={18} color={colors.primary} />
                    <Text style={styles.quickInfoText}>License: {labInfo.licenseNumber}</Text>
                  </View>
                )}
                {labInfo.operatingHours && (
                  <View style={styles.quickInfoItem}>
                    <Ionicons name="time-outline" size={18} color={colors.primary} />
                    <Text style={styles.quickInfoText}>{labInfo.operatingHours}</Text>
                  </View>
                )}
                {labInfo.servicesOffered && (
                  <View style={styles.quickInfoItem}>
                    <Ionicons name="medical-outline" size={18} color={colors.primary} />
                    <Text style={styles.quickInfoText} numberOfLines={2}>{labInfo.servicesOffered}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Location Info */}
            {(labInfo.address || labInfo.city) && (
              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                  <Text style={styles.quickInfoText} numberOfLines={2}>
                    {labInfo.address}{labInfo.city ? `, ${labInfo.city}` : ""}
                  </Text>
                </View>
              </View>
            )}

            {/* Account Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.sectionContent}>

                <ProfileOptions
                  leftIcon={<Ionicons name="person-outline" size={22} color={colors.primary} />}
                  title="Edit Profile"
                  description="Update personal details"
                  onPress={() => router.push("/(lab)/edit-profile")}
                />

                <ProfileOptions
                  leftIcon={<Ionicons name="trash-outline" size={22} color={colors.danger} />}
                  title="Delete Account"
                  description="Permanently remove your account"
                  onPress={() => router.push("/(lab)/delete-account")}
                  showBorder={false}
                />

              </View>
            </View>

            {/* Support */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.sectionContent}>

                <ProfileOptions
                  leftIcon={<Ionicons name="help-circle-outline" size={22} color={colors.primary} />}
                  title="Help & Support"
                  description="Get assistance and support"
                  onPress={() => router.push("/(lab)/help")}
                />

                <ProfileOptions
                  leftIcon={<Ionicons name="information-circle-outline" size={22} color={colors.primary} />}
                  title="About App"
                  description="App version and details"
                  onPress={() => router.push("/(lab)/about")}
                  showBorder={false}
                />

              </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color={colors.white} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />

    </View>
  );
};

export default LabProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: sizes.paddingHorizontal,
    zIndex: 10,
    elevation: 8,
  },

  headerContent: {
    width: '100%',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },

  headerAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
  },

  headerEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },

  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
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

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 120,
  },

  quickInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    gap: 12,
  },

  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quickInfoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.text,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginBottom: 10,
    marginLeft: 4,
  },

  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
    elevation: 2,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
