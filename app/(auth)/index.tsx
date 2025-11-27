import { Email, Lock } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useAuthContext } from "@/hooks/useContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

let email_schema = object({
  email: string().required("Email is required").email("Invalid email"),
  password: string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const index = () => {
  const { login } = useAuthContext();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: (value) => login(value),
    validationSchema: email_schema,
  });

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
          {/* Logo with gradient background */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              <Image
                source={require("@/assets/png/logo.png")}
                style={styles.logoImage}
              />
            </LinearGradient>
          </View>

          <Text style={[appStyles.h3, styles.headingStyle]}>Welcome Back!</Text>
          <Text style={styles.subheadingStyle}>
            Login to continue your health journey
          </Text>

          <View style={styles.formContainer}>
            <FormInput
              LeftIcon={Email}
              placeholder="Enter your email"
              keyboardType="email-address"
              onBlur={handleBlur("email")}
              onChangeText={handleChange("email")}
              value={values.email}
              containerStyle={{ marginTop: 12 }}
              error={touched.email && errors.email ? errors.email : undefined}
              autoCapitalize="none"
            />
            <FormInput
              LeftIcon={Lock}
              placeholder="Enter your password"
              isPassword
              onBlur={handleBlur("password")}
              onChangeText={handleChange("password")}
              value={values.password}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.password && errors.password ? errors.password : undefined
              }
            />
            
            <View style={styles.rememberMeContainer}>
              <View style={styles.rememberMeRow}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: "#D1D5DB", true: colors.primary + "80" }}
                  thumbColor={rememberMe ? colors.primary : "#F3F4F6"}
                />
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <AppButton
            title="Login"
            disabled={!isValid || !dirty}
            onPress={handleSubmit}
          />

          {/* Divider with OR */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomTextStyle}>
            <Text style={appStyles.body1}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  gradientBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
    tintColor: colors.white,
  },
  headingStyle: {
    textAlign: "center",
    marginBottom: 8,
  },
  subheadingStyle: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.gray,
    marginBottom: 8,
  },
  adminInfoCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  adminInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  adminInfoTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  adminInfoText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.black,
    marginBottom: 4,
  },
  adminInfoBold: {
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  formContainer: {
    marginTop: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  rememberMeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  forgotPasswordStyle: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomTextStyle: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
});
