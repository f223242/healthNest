import { Email } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

let email_schema = object({
  email: string().required("email is required").email("Invalid email"),
});

const ForgotPassword = () => {
  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: (value) => router.push("/(auth)/otp-screen"),
    validationSchema: email_schema,
  });
  const router = useRouter();
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
            Don't worry! Enter your email address and we'll send you a verification code to reset your password.
          </Text>
          
          <View style={styles.inputContainer}>
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
        </View>
        <View>
          <AppButton
            title="Send Code"
            disabled={!isValid || !dirty}
            onPress={handleSubmit}
          />
          <Text style={styles.infoText}>
            <Ionicons name="information-circle-outline" size={16} color={colors.gray} />
            {"  "}You will receive a 4-digit code
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
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginTop: 16,
    alignItems: "center",
  },
});
