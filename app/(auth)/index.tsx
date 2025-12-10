import { Email, Lock } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { firebaseMessages } from "@/constant/messages";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Image, Platform, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

const { width, height } = Dimensions.get("window");

let email_schema = object({
  email: string()
    .required("Email is required")
    .email("Invalid email format")
    .trim(),
  password: string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const index = () => {
  const { login } = useAuthContext();
  const toast = useToast();
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      await login(values);
      toast.show({
        type: firebaseMessages.loginSuccess.type as any,
        text1: firebaseMessages.loginSuccess.text1,
        text2: firebaseMessages.loginSuccess.text2,
      });
    } catch (error: any) {
      toast.show({
        type: error.type || 'error',
        text1: error.text1 || 'Login Failed',
        text2: error.text2 || error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: handleLogin,
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Gradient Header Background */}
      <LinearGradient
        colors={[colors.primary, "#00D68F", "#00B37A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.logoContainer, { 
          opacity: fadeAnim,
          transform: [{ scale: logoScale }]
        }]}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/png/logo.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brandName}>HealthNest</Text>
          <Text style={styles.brandTagline}>Your Health, Our Priority</Text>
        </Animated.View>
      </LinearGradient>
      
      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <Animated.View style={[styles.formCard, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subheadingStyle}>
            Login to continue your health journey
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <FormInput
                LeftIcon={Email}
                placeholder="Enter your email"
                keyboardType="email-address"
                onBlur={handleBlur("email")}
                onChangeText={handleChange("email")}
                value={values.email}
                error={touched.email && errors.email ? errors.email : undefined}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputWrapper}>
              <FormInput
                LeftIcon={Lock}
                placeholder="Enter your password"
                isPassword
                onBlur={handleBlur("password")}
                onChangeText={handleChange("password")}
                value={values.password}
                error={
                  touched.password && errors.password ? errors.password : undefined
                }
              />
            </View>
            
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
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!isValid || !dirty || isSubmitting) && styles.loginButtonDisabled
            ]}
            disabled={!isValid || !dirty || isSubmitting}
            onPress={() => handleSubmit()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!isValid || !dirty || isSubmitting) 
                ? ["#A8A8A8", "#888888"] 
                : [colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isSubmitting && (
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.loginButtonText}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Text>
              {!isSubmitting && (
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider with OR */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <LinearGradient
                colors={["#fff", "#F8F8F8"]}
                style={styles.socialButtonInner}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <LinearGradient
                colors={["#fff", "#F8F8F8"]}
                style={styles.socialButtonInner}
              >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <LinearGradient
                colors={["#fff", "#F8F8F8"]}
                style={styles.socialButtonInner}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomTextStyle}>
            <Text style={styles.bottomText}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 55,
    height: 55,
    tintColor: colors.white,
  },
  brandName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: "space-between",
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subheadingStyle: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.gray,
    marginBottom: 24,
  },
  formContainer: {
    marginTop: 0,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  rememberMeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: colors.gray,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  socialButtonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  bottomTextStyle: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.gray,
  },
  signUpText: {
    fontFamily: Fonts.bold,
    color: colors.primary,
    fontSize: 15,
  },
});
