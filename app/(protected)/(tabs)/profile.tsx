import AppButton from "@/component/AppButton";
import ProfileOptions from "@/component/ProfileOptions";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const Profile = () => {
  const router = useRouter();
  const {logout} =  useAuthContext()  // <- Example of using a custom hook for authentication 
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <LinearGradient
        colors={[colors.primary, "#00B976", "#00D68F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
              }}
              style={styles.imageStyle}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => router.push("/(protected)/edit-profile")}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>Qasim Ali</Text>
          <Text style={styles.userEmail}>qasim.ali@example.com</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <ProfileOptions
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            title="Edit Profile"
            onPress={() => router.push("/(protected)/edit-profile")}
          
          />

          <ProfileOptions
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
            title="Change Password"
            onPress={() => router.push("/(protected)/change-password")}
              containerStyle={{marginTop:8}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <ProfileOptions
            leftIcon={<Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />}
            title="AI Assistant"
            onPress={() => router.push("/(protected)/general-chat")}
              containerStyle={{marginTop:8}}
          />

          <ProfileOptions
            leftIcon={<Ionicons name="notifications-outline" size={20} color={colors.primary} />}
            title="Notifications"
            onPress={() => router.push("/(protected)/notifications")}
              containerStyle={{marginTop:8}}
          />

          <ProfileOptions
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />}
            title="Privacy & Security"
            onPress={() => router.push("/(protected)/privacy")}
              containerStyle={{marginTop:8}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <ProfileOptions
            leftIcon={<Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />}
            title="Complain to Admin"
            onPress={() => router.push("/(protected)/complain")}
            containerStyle={{marginTop:8}}
          />
        </View>

       
          <AppButton 
            title="Log Out" 
            containerStyle={{backgroundColor: "#FF3B30"}} 
            onPress={logout}  
          />
     
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    marginBottom: 16,
  },
  imageStyle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  editIconButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
