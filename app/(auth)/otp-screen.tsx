import AppButton from "@/component/AppButton";
import OtpCompnent from "@/component/OtpCompnent";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";
let otp_schema = object({
  otp: string().required("OTP is required").length(4, "OTP must be 4 digits"),
});

const OtpScreen = () => {
  const router = useRouter();
  const [seconds, setSeconds] = useState(59);
  const [minutes, setMinutes] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otp_schema,
    onSubmit: (values) => {
      router.push("/(auth)/reset-password");
    },
  });
  const { handleSubmit, isValid, setFieldValue, values } = formik;

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

  const handleResend = () => {
    setSeconds(59);
    setMinutes(0);
    setCanResend(false);
    setFieldValue("otp", "");
    // Add your resend OTP API call here
    console.log("Resend OTP");
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={64} color={colors.primary} />
          </View>

          <Text style={[appStyles.h3, { textAlign: "center", marginTop: 24 }]}>
            Verify your email
          </Text>
          <Text
            style={[appStyles.body1, { textAlign: "center", marginTop: 8, color: colors.gray, paddingHorizontal: 16 }]}
          >
            We sent a verification code to your email address. Please enter it
            below.
          </Text>
          <OtpInput
            numberOfDigits={4}
            focusColor={colors.primary}
            autoFocus={false}
            theme={{
              containerStyle: styles.otpContainerStyle,
              pinCodeContainerStyle: styles.pinCodeStyle,
              pinCodeTextStyle: styles.pinCodeTextStyle,
            }}
            onTextChange={(text) => {
              setFieldValue("otp", text);
            }}
            onFilled={(code) => {
              setFieldValue("otp", code);
              console.log("OTP Filled:", code);
            }}
          />
          {/* Timer */}
          <View style={styles.timerSection}>
            <Text style={[appStyles.body1, { color: colors.gray, marginBottom: 8 }]}>
              Code expires in
            </Text>
            <View style={styles.otpCardContainer}>
              <OtpCompnent text={minutes.toString().padStart(2, "0")} label="Minutes" />
              <View style={styles.colonContainer}>
                <Text style={styles.colonText}>:</Text>
              </View>
              <OtpCompnent text={seconds.toString().padStart(2, "0")} label="Seconds" />
            </View>
          </View>
        </View>

        <View>
          <AppButton
            title="Verify"
            disabled={!isValid || values.otp.length < 4}
            onPress={handleSubmit}
          />
          <View style={styles.resendContainer}>
            <Text style={[appStyles.body1, { color: colors.gray }]}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              style={{ marginTop: 8 }}
            >
              <Text
                style={[
                  appStyles.body1,
                  {
                    color: canResend ? colors.primary : colors.lightGreen,
                    fontFamily: Fonts.semiBold,
                  },
                ]}
              >
                {canResend ? "Resend Code" : `Resend in ${minutes}:${seconds.toString().padStart(2, "0")}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 32,
    backgroundColor: colors.lightGreen,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  otpContainerStyle: {
    width: "80%",
    alignSelf: "center",
    marginTop: 32,
  },
  pinCodeStyle: {
    height: 52,
    width: 44,
    borderRadius: 12,
  },
  pinCodeTextStyle: {
    fontSize: 20,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  scrollContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    flexGrow: 1,
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  card: {
    height: 56,
    borderRadius: 8,
    backgroundColor: "#E5F5F0",
    flex: 1,
    marginHorizontal: 4,
    marginTop: 24,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,

    justifyContent: "center",
    textAlign: "center",
    lineHeight: 60,
  },
  timerSection: {
    alignItems: "center",
    marginTop: 32,
  },
  otpCardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  colonContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  colonText: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});
