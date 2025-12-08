import LogoutModal from "@/component/ModalComponent/LogoutModal";
import ProfileOptions from "@/component/ProfileOptions";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { LabInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Body */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          {labInfo.profileImage ? (
            <Image
              source={{ uri: labInfo.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileImagePlaceholder}
            >
              <Ionicons name="flask" size={32} color={colors.white} />
            </LinearGradient>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{labInfo.labName || labInfo.fullName}</Text>
            <Text style={styles.profileEmail}>{labInfo.email}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>LAB</Text>
              </View>
              {labInfo.homeSampling && (
                <View style={[styles.roleBadge, { backgroundColor: colors.secondary + "15" }]}>
                  <Text style={[styles.roleText, { color: colors.secondary }]}>Home Sampling</Text>
                </View>
              )}
            </View>
          </View>
        </View>

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

      </ScrollView>

      <LogoutModal 
        visible={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout} 
      />

    </SafeAreaView>
  );
};

export default LabProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 16,
    paddingBottom: 120,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.primary,
  },

  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 2,
  },

  profileEmail: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 8,
  },

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  roleBadge: {
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    letterSpacing: 0.5,
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
