import { Lock } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import ResetPasswordModal from "@/component/ModalComponent/ResetPasswordModal";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
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

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
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
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <View>
            {/* Back Button
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity> */}

            {/* Icon with gradient background */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCircle}
              >
                <Ionicons name="shield-checkmark-outline" size={56} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={[appStyles.h3, { marginTop: 32, textAlign: "center" }]}>
              Verify OTP
            </Text>
            <Text style={styles.subheadingStyle}>
              Enter the 6-digit code sent to{"\n"}
              <Text style={{ fontFamily: Fonts.semiBold, color: colors.primary }}>
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

            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResendOTP} 
                  disabled={isResending}
                >
                  <Text style={styles.resendText}>
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend OTP in <Text style={styles.timerNumber}>{timer}s</Text>
                </Text>
              )}
            </View>
          </View>

          <View>
            <AppButton
              title={isVerifying ? "Verifying..." : "Verify OTP"}
              onPress={handleVerifyOTP}
              disabled={otpCode.length !== 6 || isVerifying}
            >
              {isVerifying && (
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              )}
            </AppButton>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  // Password Reset Screen (after OTP verified)
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View>
          {/* Back Button */}
          {/* <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity> */}

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
        </View>

        <View>
          <AppButton
            title={isSubmitting ? "Updating..." : "Reset Password"}
            onPress={handleSubmit}
            disabled={!dirty || !isValid || isSubmitting}
            containerStyle={{ marginTop: 20 }}
          >
            {isSubmitting && (
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            )}
          </AppButton>
        </View>
      </KeyboardAwareScrollView>
      <ResetPasswordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.replace("/(auth)");
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
  otpWrapper: {
    alignSelf: "center",
    marginTop: 32,
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
    backgroundColor: colors.lightGray,
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
  resendContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  timerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
  },
  timerNumber: {
    fontFamily: Fonts.semiBold,
    color: colors.primary,
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
