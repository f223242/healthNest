import LogoutModal from "@/component/ModalComponent/LogoutModal";
import ProfileOptions from "@/component/ProfileOptions";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { NurseInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NurseProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Extract nurse info from additionalInfo
  const nurseInfo = useMemo(() => {
    const additionalInfo = user?.additionalInfo as NurseInfo | undefined;
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "Nurse";
    const profileImage = additionalInfo?.profileImage || null;
    const email = user?.email || "nurse@healthnest.com";
    const specialization = additionalInfo?.specialization || null;
    const experience = additionalInfo?.experience || null;
    const hourlyRate = additionalInfo?.hourlyRate || null;
    const availability = additionalInfo?.availability || null;
    const address = additionalInfo?.address || null;
    const city = additionalInfo?.city || null;
    const certifications = additionalInfo?.certifications || null;
    
    return {
      fullName,
      firstName,
      lastName,
      profileImage,
      email,
      specialization,
      experience,
      hourlyRate,
      availability,
      address,
      city,
      certifications,
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
    <SafeAreaView edges={[ "bottom"]} style={styles.container}>
      {/* Body */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          {nurseInfo.profileImage ? (
            <Image
              source={{ uri: nurseInfo.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileImagePlaceholder}
            >
              <Ionicons name="person" size={32} color={colors.white} />
            </LinearGradient>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{nurseInfo.fullName}</Text>
            <Text style={styles.profileEmail}>{nurseInfo.email}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>NURSE</Text>
              </View>
              {nurseInfo.specialization && (
                <View style={[styles.roleBadge, { backgroundColor: colors.secondary + "15" }]}>
                  <Text style={[styles.roleText, { color: colors.secondary }]}>{nurseInfo.specialization}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Info Section */}
        {(nurseInfo.experience || nurseInfo.hourlyRate || nurseInfo.availability) && (
          <View style={styles.quickInfoCard}>
            {nurseInfo.experience && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={styles.quickInfoText}>{nurseInfo.experience} Experience</Text>
              </View>
            )}
            {nurseInfo.hourlyRate && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
                <Text style={styles.quickInfoText}>Rs. {nurseInfo.hourlyRate}/hr</Text>
              </View>
            )}
            {nurseInfo.availability && (
              <View style={styles.quickInfoItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.quickInfoText}>{nurseInfo.availability}</Text>
              </View>
            )}
          </View>
        )}

        {/* Location Info */}
        {(nurseInfo.address || nurseInfo.city) && (
          <View style={styles.quickInfoCard}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.quickInfoText} numberOfLines={2}>
                {nurseInfo.address}{nurseInfo.city ? `, ${nurseInfo.city}` : ""}
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
              onPress={() => router.push("/(nurse)/edit-profile")}
            />

            <ProfileOptions
              leftIcon={<Ionicons name="trash-outline" size={22} color={colors.danger} />}
              title="Delete Account"
              description="Permanently remove your account"
              onPress={() => router.push("/(nurse)/delete-account")}
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
              onPress={() => router.push("/(nurse)/help")}
            />

            <ProfileOptions
              leftIcon={<Ionicons name="information-circle-outline" size={22} color={colors.primary} />}
              title="About App"
              description="App version and details"
              onPress={() => router.push("/(nurse)/about")}
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

export default NurseProfile;
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
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginBottom: 10,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",

    // Shadows
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
