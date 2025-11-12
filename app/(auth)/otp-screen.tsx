import AppButton from "@/component/AppButton";
import OtpCompnent from "@/component/OtpCompnent";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";
let otp_schema = object({
  otp: string().required("OTP is required").length(4, "OTP must be 4 digits"),
});

const OtpScreen = () => {
  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otp_schema,
    onSubmit: (values) => {
      router.push("/(auth)/reset-password");
    },
  });
  const router = useRouter();
  const { handleSubmit, isValid, dirty, setFieldValue, values } = formik;
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View>
          <Text style={[appStyles.h3, { textAlign: "center", marginTop: 20 }]}>
            Enter the code
          </Text>
          <Text
            style={[appStyles.body1, { textAlign: "center", marginTop: 8 }]}
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
          <>
            <View style={styles.otpCardContainer}>
              <OtpCompnent text="00" />
              <OtpCompnent text="59" />
            </View>
            <View style={styles.timelabelContainer}>
              <Text style={appStyles.body1}>Seconds</Text>
              <Text style={appStyles.body1}>Minutes</Text>
            </View>
          </>
        </View>

        <View>
          <AppButton
            title="Verify"
            disabled={!isValid || values.otp.length < 4}
            onPress={handleSubmit}
          />
          <Text
            style={[appStyles.body1, { textAlign: "center", marginTop: 20 }]}
          >
            Didn't receive the code?{" "}
            <Text style={{ color: colors.primary, fontFamily: Fonts.semiBold }}>
              Send again
            </Text>
          </Text>
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
  timelabelContainer: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 8,
    marginHorizontal: sizes.paddingHorizontal + 45,
  },
  otpCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 8,
  },
});
