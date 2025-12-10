import { Lock } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import ResetPasswordModal from "@/component/ModalComponent/ResetPasswordModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import { object } from "yup";

const { width } = Dimensions.get("window");

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
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const { verifyPasswordResetOTP, resendPasswordResetOTP, updatePassword } = useAuthContext();
  const toast = useToast();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  // Timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter a 6-digit OTP",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const isValid = await verifyPasswordResetOTP(otpCode);
      if (isValid) {
        setOtpVerified(true);
        toast.show({
          type: "success",
          text1: "OTP Verified",
          text2: "Now set your new password",
        });
      }
    } catch (error: any) {
      toast.show({
        type: error.type || "error",
        text1: error.text1 || "Verification Failed",
        text2: error.text2 || "Invalid or expired OTP",
      });
      setOtpCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      await resendPasswordResetOTP();
      setTimer(60);
      setCanResend(false);
      setOtpCode("");
      toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A new OTP has been sent to your phone",
      });
    } catch (error: any) {
      toast.show({
        type: error.type || "error",
        text1: error.text1 || "Error",
        text2: error.text2 || "Failed to resend OTP",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: reset_password_schema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await updatePassword(values.password);
        setModalVisible(true);
      } catch (error: any) {
        toast.show({
          type: error.type || "error",
          text1: error.text1 || "Error",
          text2: error.text2 || "Failed to update password",
        });
        // Stay on current screen - don't navigate or show modal
        return;
      } finally {
        setIsSubmitting(false);
      }
    },
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

  // Handle back navigation
  // const handleBack = () => {
  //   router.back();
  // };

  // OTP Verification Screen
  if (!otpVerified) {
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
              <Ionicons name="shield-checkmark-outline" size={36} color={colors.white} />
            </View>
            <Text style={styles.headerTitle}>Verify OTP</Text>
            <Text style={styles.headerSubtitle}>Enter verification code</Text>
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
            <Text style={styles.otpInfoText}>
              Enter the 6-digit code sent to{"\n"}
              <Text style={styles.phoneHighlight}>
                {params.phoneNumber}
              </Text>
            </Text>

            {/* OTP Input using react-native-otp-entry */}
            <View style={styles.otpWrapper}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setOtpCode}
                focusColor={colors.primary}
                focusStickBlinkingDuration={500}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpPinContainer,
                  pinCodeTextStyle: styles.otpPinText,
                  focusedPinCodeContainerStyle: styles.otpPinContainerFocused,
                  filledPinCodeContainerStyle: styles.otpPinContainerFilled,
                }}
              />
            </View>

            <View style={styles.resendOtpContainer}>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResendOTP} 
                  disabled={isResending}
                >
                  <Text style={styles.resendOtpText}>
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.timerText}>
                    Resend in {timer}s
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.submitButton, (otpCode.length !== 6 || isVerifying) && styles.submitButtonDisabled]}
              disabled={otpCode.length !== 6 || isVerifying}
              onPress={handleVerifyOTP}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(otpCode.length !== 6 || isVerifying) 
                  ? ["#A8A8A8", "#888888"] 
                  : [colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isVerifying && (
                  <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.submitButtonText}>
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </Text>
                {!isVerifying && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
      </View>
    );
  }

  // Password Reset Screen (after OTP verified)
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
            <Ionicons name="key-outline" size={36} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>Create a new password</Text>
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
          <Text style={styles.passwordInfoText}>
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
              error={touched.password && errors.password ? errors.password : undefined}
            />

            <FormInput
              LeftIcon={Lock}
              placeholder="Confirm Password"
              containerStyle={{ marginTop: 12 }}
              isPassword
              onBlur={handleBlur("confirmPassword")}
              onChangeText={handleChange("confirmPassword")}
              value={values.confirmPassword}
              error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
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
                {isSubmitting ? "Updating..." : "Reset Password"}
              </Text>
              {!isSubmitting && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAwareScrollView>
      <ResetPasswordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.replace("/(auth)");
        }}
      />
    </SafeAreaView>
    </View>
  );
};

export default ResetPassword;

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
  otpInfoText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  phoneHighlight: {
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  passwordInfoText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  otpWrapper: {
    alignSelf: "center",
    marginTop: 28,
  },
  otpContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpPinContainer: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
    backgroundColor: "#F8F9FA",
  },
  otpPinText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  otpPinContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpPinContainerFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  resendOtpContainer: {
    marginTop: 28,
    alignItems: "center",
  },
  resendOtpText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: colors.primary,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  formContainer: {
    marginTop: 8,
  },
  requirementsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
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
    gap: 10,
  },
  requirementText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.text,
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
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
