import AppButton from "@/component/AppButton";
import InstructionSteps from "@/component/InstructionSteps";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// Verification instructions
const verificationSteps = [
  { text: "Open your email inbox" },
  { text: "Find the email from HealthNest" },
  { text: "Click the verification link" },
  { text: "Come back and tap \"I've Verified\"" },
];

const OtpScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resendVerificationEmail, checkEmailVerification, logout } = useAuthContext();
  const toast = useToast();

  const [seconds, setSeconds] = useState(59);
  const [minutes, setMinutes] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        setCanResend(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, minutes]);

  // Auto-check email verification periodically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const isVerified = await checkEmailVerification();
        if (isVerified) {
          clearInterval(checkInterval);
          toast.show({
            type: "success",
            text1: "Email Verified",
            text2: "Your email has been verified successfully. Please login.",
          });
          // Small delay to ensure sign out completes before navigation
          setTimeout(() => {
            router.replace("/(auth)");
          }, 500);
        }
      } catch (error) {
        // Silently fail on background checks
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, []);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
      setSeconds(59);
      setMinutes(0);
      setCanResend(false);
      toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "Verification email has been resent",
      });
    } catch (error: any) {
      toast.show({
        type: "error",
        text1: error.text1 || "Error",
        text2: error.text2 || "Failed to resend verification email",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsChecking(true);
      const isVerified = await checkEmailVerification();

      if (isVerified) {
        toast.show({
          type: "success",
          text1: "Email Verified",
          text2: "Your email has been verified successfully. Please login.",
        });
        // Small delay to ensure everything completes
        setTimeout(() => {
          router.replace("/(auth)");
        }, 500);
      } else {
        toast.show({
          type: "warning",
          text1: "Not Verified Yet",
          text2: "Please check your email and click the verification link",
        });
      }
    } catch (error: any) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to check verification status",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await logout();
      router.replace("/(auth)");
    } catch (error) {
      router.replace("/(auth)");
    }
  };

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
              <Ionicons name="mail-outline" size={56} color={colors.white} />
            </LinearGradient>
          </View>

          <Text style={[appStyles.h3, { textAlign: "center", marginTop: 24 }]}>
            Verify your Email
          </Text>
          <Text
            style={[
              appStyles.body1,
              { textAlign: "center", marginTop: 8, color: colors.gray, paddingHorizontal: 16 },
            ]}
          >
            We've sent a verification link to{"\n"}
            <Text style={{ fontFamily: Fonts.semiBold, color: colors.primary }}>
              {email || "your email"}
            </Text>
          </Text>

          {/* Instructions */}
          <InstructionSteps
            steps={verificationSteps}
            containerStyle={styles.instructionsContainer}
          />

          {/* Timer */}
          <View style={styles.timerSection}>
            <Text style={[appStyles.body1, { color: colors.gray }]}>
              {canResend
                ? "You can resend the email now"
                : `Resend email in ${minutes}:${seconds.toString().padStart(2, "0")}`}
            </Text>
          </View>
        </View>

        <View>
          <AppButton
            title={isChecking ? "Checking..." : "I've Verified My Email"}
            disabled={isChecking}
            onPress={handleCheckVerification}
          >
            {isChecking && (
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            )}
          </AppButton>

          <View style={styles.resendContainer}>
            <Text style={[appStyles.body1, { color: colors.gray }]}>
              Didn't receive the email?
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend || isResending}
              style={{ marginTop: 8 }}
            >
              {isResending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text
                  style={[
                    appStyles.body1,
                    {
                      color: canResend ? colors.primary : colors.gray,
                      fontFamily: Fonts.semiBold,
                    },
                  ]}
                >
                  Resend Email
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Check Spam Notice */}
          <View style={styles.spamNotice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.gray} />
            <Text style={styles.spamNoticeText}>
              Check your spam folder if you don't see the email
            </Text>
          </View>
          
          {/* Back to Login */}
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backToLoginButton}
          >
            <Text style={[appStyles.body1, { color: colors.primary, fontFamily: Fonts.semiBold }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
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
  instructionsContainer: {
    marginTop: 32,
  },
  timerSection: {
    alignItems: "center",
    marginTop: 24,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  spamNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  spamNoticeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
  },
  backToLoginButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
  },
});
