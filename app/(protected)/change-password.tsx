import { LockIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

const ChangePassword = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: (values) => {
      // Handle password change logic
      console.log("Password change values:", values);
      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit } =
    formik;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <Text style={appStyles.bodyText}>
          Your new password must be different from previously used passwords.
        </Text>

        {/* Form Inputs */}
        <View style={{ gap: 16, marginTop: 24 }}>
          <FormInput
            value={values.currentPassword}
            onChangeText={handleChange("currentPassword")}
            onBlur={handleBlur("currentPassword")}
            placeholder="Current Password"
            isPassword
            LeftIcon={LockIcon}
            error={
              touched.currentPassword && errors.currentPassword
                ? errors.currentPassword
                : undefined
            }
          />

          <FormInput
            value={values.newPassword}
            onChangeText={handleChange("newPassword")}
            onBlur={handleBlur("newPassword")}
            placeholder="New Password"
            isPassword
            LeftIcon={LockIcon}
            error={
              touched.newPassword && errors.newPassword
                ? errors.newPassword
                : undefined
            }
          />

          <FormInput
            value={values.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            onBlur={handleBlur("confirmPassword")}
            placeholder="Confirm New Password"
            isPassword
            LeftIcon={LockIcon}
            error={
              touched.confirmPassword && errors.confirmPassword
                ? errors.confirmPassword
                : undefined
            }
          />
        </View>

        {/* Change Password Button */}
        <AppButton
          title="Change Password"
          containerStyle={{ marginTop: 32 }}
          onPress={handleSubmit}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
  },
});
