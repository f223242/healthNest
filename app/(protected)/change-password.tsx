import { LockIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

const ChangePassword = () => {
  const router = useRouter();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Handle password change logic
      console.log("Password change values:", values);
      toast.success("Password changed successfully!");
      setTimeout(() => router.back(), 1500);
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit, isValid } =
    formik;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View>
          {/* Icon with gradient background */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCircle}
            >
              <Ionicons name="key-outline" size={56} color={colors.white} />
            </LinearGradient>
          </View>

          <Text style={[appStyles.h3, { marginTop: 24, textAlign: "center" }]}>
            Change Password
          </Text>
          <Text style={styles.subheadingStyle}>
            Your new password must be different from previously used passwords
          </Text>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
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
              containerStyle={{ marginTop: 12 }}
            />

            <FormInput
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              placeholder="Confirm New Password"
              isPassword
              LeftIcon={LockIcon}
              containerStyle={{ marginTop: 12 }}
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>New password must contain:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={values.newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={values.newPassword.length >= 8 ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[a-z]/.test(values.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[a-z]/.test(values.newPassword) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One lowercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(values.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[A-Z]/.test(values.newPassword) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[0-9]/.test(values.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[0-9]/.test(values.newPassword) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One number</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[^a-zA-Z0-9]/.test(values.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[^a-zA-Z0-9]/.test(values.newPassword) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One special character</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={values.newPassword && values.confirmPassword && values.newPassword === values.confirmPassword ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={values.newPassword && values.confirmPassword && values.newPassword === values.confirmPassword ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>Passwords match</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Change Password Button */}
        <AppButton
          title="Change Password"
          onPress={handleSubmit}
          disabled={!isValid}
          containerStyle={{marginTop:20}}
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
    justifyContent: "space-between",
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 20,
  },
  gradientCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subheadingStyle: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.gray,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 32,
  },
  requirementsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  requirementsTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
});
