import LogoutModal from "@/component/ModalComponent/LogoutModal";
import ProfileOptions from "@/component/ProfileOptions";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryProfile = () => {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Header */}
      <LinearGradient
          colors={[colors.primary, "#00B976", "#00D68F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=68" }}
              style={styles.imageStyle}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.userName}>{user?.email?.split("@")[0] || "Delivery Person"}</Text>
          <Text style={styles.userEmail}>{user?.email || "delivery@example.com"}</Text>
          <Text style={styles.roleBadge}>DELIVERY</Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <ProfileOptions
              leftIcon={<Ionicons name="person-outline" size={22} color={colors.primary} />}
              title="Edit Profile"
              description="Update personal details"
              onPress={() => router.push('/(delivery)/edit-profile')}
            />
            <ProfileOptions
              leftIcon={<Ionicons name="trash-outline" size={22} color={colors.danger} />}
              title="Delete Account"
              description="Permanently remove your account"
              onPress={() => router.push('/(delivery)/delete-account')}
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
              onPress={() => router.push('/(delivery)/help')}
            />
            <ProfileOptions
              leftIcon={<Ionicons name="information-circle-outline" size={22} color={colors.primary} />}
              title="About App"
              description="App version and details"
              onPress={() => router.push('/(delivery)/about')}
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

export default DeliveryProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 12,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 14,
  },
  imageStyle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.9)",
  },
  roleBadge: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.white,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 22,
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
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
