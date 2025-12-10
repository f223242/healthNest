import InstructionSteps from "@/component/InstructionSteps";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRootNavigationState, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Verification instructions
const verificationSteps = [
  { text: "Open your email inbox" },
  { text: "Find the email from HealthNest" },
  { text: "Click the verification link" },
  { text: "Come back and tap \"I've Verified\"" },
];

const OtpScreen = () => {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resendVerificationEmail, checkEmailVerification, logout } = useAuthContext();
  const toast = useToast();
  const hasNavigatedRef = useRef(false);

  const [seconds, setSeconds] = useState(59);
  const [minutes, setMinutes] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  // Helper to safely navigate
  const safeNavigate = (route: string) => {
    if (!rootNavigationState?.key || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    setTimeout(() => {
      router.replace(route as any);
    }, 100);
  };

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

  // REMOVED: Auto-check email verification - user should click button to verify

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
        safeNavigate("/(auth)");
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
      hasNavigatedRef.current = false; // Reset for manual navigation
      safeNavigate("/(auth)");
    } catch (error) {
      hasNavigatedRef.current = false;
      safeNavigate("/(auth)");
    }
  };

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
            <Ionicons name="mail-outline" size={36} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <Text style={styles.headerSubtitle}>Check your inbox</Text>
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
          <Text style={styles.emailText}>
            We've sent a verification link to{"\n"}
            <Text style={styles.emailHighlight}>
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
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.timerText}>
                {canResend
                  ? "You can resend now"
                  : `Resend in ${minutes}:${seconds.toString().padStart(2, "0")}`}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.submitButton, isChecking && styles.submitButtonDisabled]}
            disabled={isChecking}
            onPress={handleCheckVerification}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isChecking 
                ? ["#A8A8A8", "#888888"] 
                : [colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {isChecking && (
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.submitButtonText}>
                {isChecking ? "Checking..." : "I've Verified My Email"}
              </Text>
              {!isChecking && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>
              Didn't receive the email?
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend || isResending}
              style={styles.resendButton}
            >
              {isResending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text
                  style={[
                    styles.resendText,
                    !canResend && styles.resendTextDisabled
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
            <Text style={styles.backToLoginText}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
    </View>
  );
};

export default OtpScreen;

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
  emailText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  instructionsContainer: {
    marginTop: 24,
  },
  timerSection: {
    alignItems: "center",
    marginTop: 24,
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
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  resendLabel: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  resendButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  resendTextDisabled: {
    color: colors.gray,
  },
  spamNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
  backToLoginText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
});
