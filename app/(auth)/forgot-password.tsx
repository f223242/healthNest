import PhoneInput from "@/component/PhoneInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

const { width } = Dimensions.get("window");

const phoneSchema = object({
  phoneNumber: string()
    .required("Phone number is required")
    .matches(/^[0-9]{7,15}$/, "Phone number must be 7-15 digits"),
});

const ForgotPassword = () => {
  const router = useRouter();
  const { sendPasswordResetOTP } = useAuthContext();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("+92");
  const [countryFlag, setCountryFlag] = useState("🇵🇰");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendOTP = async (values: { phoneNumber: string }) => {
    try {
      setIsSubmitting(true);
      const fullPhoneNumber = `${countryCode}${values.phoneNumber}`;
      await sendPasswordResetOTP(fullPhoneNumber);
      toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A verification code has been sent to your phone",
      });
      // Navigate to reset password screen for OTP verification
      router.push({
        pathname: "/(auth)/reset-password",
        params: { phoneNumber: fullPhoneNumber },
      });
    } catch (error: any) {
      toast.show({
        type: error.type || "error",
        text1: error.text1 || "Error",
        text2: error.text2 || "Failed to send OTP",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { phoneNumber: "" },
    onSubmit: handleSendOTP,
    validationSchema: phoneSchema,
    validateOnMount: true,
  });

  const {
    handleBlur,
    handleChange,
    setFieldValue,
    values,
    touched,
    errors,
    isValid,
    dirty,
    handleSubmit,
  } = formik;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00D68F", "#00B37A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="lock-closed-outline" size={36} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>We'll help you reset it</Text>
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
            <Text style={styles.instructionText}>
              Enter your phone number and we'll send you a verification code to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <PhoneInput
                label="Phone Number"
                value={values.phoneNumber}
                onChangeText={(text) => setFieldValue("phoneNumber", text)}
                onBlur={() => handleBlur("phoneNumber")}
                error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : ""}
                countryCode={countryCode}
                countryFlag={countryFlag}
                onCountryChange={(code, flag) => {
                  setCountryCode(code);
                  setCountryFlag(flag);
                }}
                placeholder="3123456789"
                maxLength={15}
              />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.submitButton, (!dirty || !isValid || isSubmitting) && styles.submitButtonDisabled]}
              disabled={!dirty || !isValid || isSubmitting}
              onPress={() => handleSubmit()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(!dirty || !isValid || isSubmitting)
                  ? ["#A8A8A8", "#888888"]
                  : [colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isSubmitting && (
                  <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "Sending OTP..." : "Send OTP"}
                </Text>
                {!isSubmitting && (
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoText}>
              <Ionicons name="information-circle-outline" size={16} color={colors.gray} />
              <Text style={styles.infoTextLabel}>You will receive an OTP on your phone</Text>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
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
  instructionText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    marginTop: 0,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  infoText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  infoTextLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
});
