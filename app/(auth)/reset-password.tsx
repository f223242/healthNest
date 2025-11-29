import { Lock } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import ResetPasswordModal from "@/component/ModalComponent/ResetPasswordModal";

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
import { object } from "yup";

let reset_password_schema = object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

const ResetPassword = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: reset_password_schema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      console.log("Modal visible:", modalVisible);
      setModalVisible(true);
    },
  });
  const router = useRouter();
  const {
    handleBlur,
    handleChange,
    values,
    touched,
    errors,
    isValid,
    dirty,
    handleSubmit,
  } = formik;

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

          <Text style={[appStyles.h3, { marginTop: 32, textAlign: "center" }]}>
            Reset Password
          </Text>
          <Text style={styles.subheadingStyle}>
            Create a strong password to secure your account
          </Text>

          <View style={styles.formContainer}>
            <FormInput
              LeftIcon={Lock}
              placeholder="New Password"
              containerStyle={{ marginTop: 12 }}
              isPassword
              onBlur={handleBlur("password")}
              onChangeText={handleChange("password")}
              value={values.password}
            />

            <FormInput
              LeftIcon={Lock}
              placeholder="Confirm Password"
              containerStyle={{ marginTop: 12 }}
              isPassword
              onBlur={handleBlur("confirmPassword")}
              onChangeText={handleChange("confirmPassword")}
              value={values.confirmPassword}
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={values.password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={values.password.length >= 8 ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[a-z]/.test(values.password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[a-z]/.test(values.password) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One lowercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(values.password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[A-Z]/.test(values.password) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[0-9]/.test(values.password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[0-9]/.test(values.password) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One number</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[^a-zA-Z0-9]/.test(values.password) ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={/[^a-zA-Z0-9]/.test(values.password) ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>One special character</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={values.password && values.confirmPassword && values.password === values.confirmPassword ? "checkmark-circle" : "ellipse-outline"} 
                  size={18} 
                  color={values.password && values.confirmPassword && values.password === values.confirmPassword ? colors.primary : colors.gray} 
                />
                <Text style={styles.requirementText}>Passwords match</Text>
              </View>
            </View>
          </View>
        </View>

        <View>
          <AppButton
            title="Reset Password"
            onPress={handleSubmit}
            disabled={!isValid}
            containerStyle={{marginTop:20}}
          />
        </View>
      </KeyboardAwareScrollView>
      <ResetPasswordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 40,
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
