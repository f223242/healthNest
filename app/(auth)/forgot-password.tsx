import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

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
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("+92");
  const [countryFlag, setCountryFlag] = useState("🇵🇰");

  const handleSendOTP = async (values: { phoneNumber: string }) => {
    try {
      setIsSubmitting(true);
      const fullPhoneNumber = `${countryCode}${values.phoneNumber}`;
      await sendPasswordResetOTP(fullPhoneNumber);
      toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "Check your phone for the verification code",
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
          {/* Icon with gradient background */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCircle}
            >
              <Ionicons name="lock-closed-outline" size={56} color={colors.white} />
            </LinearGradient>
          </View>

          <Text style={[appStyles.h3, { marginTop: 32, textAlign: "center" }]}>
            Forgot Password?
          </Text>
          <Text style={[appStyles.body1, { marginTop: 12, textAlign: "center", color: colors.gray, paddingHorizontal: 20 }]}>
            Don't worry! Enter your phone number and we'll send you a verification code to reset your password.
          </Text>
          
          <View style={styles.inputContainer}>
            {/* Phone Number with Country Code */}
            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryFlag}>{countryFlag}</Text>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.gray} />
              </TouchableOpacity>
              <View style={styles.phoneInputContainer}>
                <FormInput
                  placeholder="Phone Number"
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  value={values.phoneNumber}
                  keyboardType="phone-pad"
                  containerStyle={styles.phoneInput}
                  error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : undefined}
                />
              </View>
            </View>

            {/* Country Picker Modal */}
            <CountryPicker
              show={showCountryPicker}
              lang="en"
              pickerButtonOnPress={(item) => {
                setCountryCode(item.dial_code);
                setCountryFlag(item.flag);
                setShowCountryPicker(false);
              }}
              onBackdropPress={() => setShowCountryPicker(false)}
              style={{
                modal: {
                  height: 500,
                },
              }}
            />
          </View>
        </View>
        <View>
          <AppButton
            title={isSubmitting ? "Sending OTP..." : "Send OTP"}
            disabled={!isValid || !dirty || isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting && (
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            )}
          </AppButton>
          <Text style={styles.infoText}>
            <Ionicons name="information-circle-outline" size={16} color={colors.gray} />
            {"  "}You will receive an OTP on your phone
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
  inputContainer: {
    marginTop: 32,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    height: 56,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 14,
    color: colors.black,
    fontFamily: Fonts.medium,
    marginRight: 4,
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    marginTop: 0,
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginTop: 16,
    alignItems: "center",
  },
});
