import { BellIcon, ChangePassword, EditProfileIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import ProfileOptions from "@/component/ProfileOptions";
import { appStyles, colors, sizes } from "@/constant/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.cardStyle}>
        <Image
          source={{
            uri: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
          }}
          style={styles.imageStyle}
          resizeMode="cover"
        />
        <Text style={[appStyles.h4, { color: colors.white, marginTop: 10 }]}>
          Qasim Ali
        </Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scrollContainer]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View style={{ gap: 12 }}>
          <ProfileOptions
            leftIcon={<EditProfileIcon />}
            title="Edit Profile"
            containerStyle={{ marginTop: 16 }}
          />
          <ProfileOptions
            leftIcon={<ChangePassword />}
            title="Change Password"
          />
          <ProfileOptions leftIcon={<EditProfileIcon />} title="Privacy" />
          <ProfileOptions leftIcon={<BellIcon />} title="Notice" />
          <ProfileOptions leftIcon={<BellIcon />} title="Notice" />
          <ProfileOptions leftIcon={<BellIcon />} title="Notice" />
        </View>

        <AppButton title="LogOut" containerStyle={{ marginTop: 16 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    backgroundColor: colors.white,
    paddingBottom: 40,
  },
  cardStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  imageStyle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
