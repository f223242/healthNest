import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
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
import * as Yup from "yup";

import { DropDownIcon, Email, Person } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import AuthHeader from "@/component/AuthHeader";
import FormCard from "@/component/FormCard";
import FormInput from "@/component/FormInput";
import PhoneInput from "@/component/PhoneInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ----------------------
// Yup Validation Schema
// ----------------------
const SignupSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .matches(/[a-z]/, "At least one lowercase letter required")
    .matches(/[A-Z]/, "At least one uppercase letter required")
    .matches(/\d/, "At least one digit required")
    .matches(/[@$!%*?&]/, "At least one special character required")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit number")
    .required("Phone number is required"),
  role: Yup.string().required("Role is required"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
});

// ----------------------
// Role Options
// ----------------------
const roleOptions = [
  { label: "User", value: "User" },
  { label: "Lab", value: "Lab" },
  { label: "Nurse", value: "Nurse" },
  { label: "Medicine Delivery", value: "Medicine Delivery" },
];

// ----------------------
// Component
// ----------------------
export default function SignupScreen() {
  const { register } = useAuthContext();
  const { showToast } = useToast();
  const router = useRouter();

  const [showPicker, setShowPicker] = useState(false);
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

  // ----------------------
  // Formik Hook
  // ----------------------
  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      phoneNumber: "",
      dateOfBirth: "",
    },
    validationSchema: SignupSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formattedPhone = `${countryCode}${values.phoneNumber}`;
        const payload = { ...values, phoneNumber: formattedPhone };
        await register(payload);

        // Don't navigate manually - _layout.tsx will detect pending user 
        // and automatically redirect to otp-screen
      } catch (error: any) {
        showToast(error?.text2 || "Failed to sign up", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isValid,
    dirty,
    isSubmitting,
  } = formik;

  // ----------------------
  // Date Picker Handler
  // ----------------------
  const onDateSelect = (_: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setFieldValue("dateOfBirth", date.toISOString());
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Auth Header */}
      <AuthHeader
        icon="person-add"
        iconSize={32}
        title="Create Account"
        subtitle="Sign up to get started"
        fadeAnim={fadeAnim}
      />

      <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
        >
          <FormCard animatedStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} style={styles.formCard}>

            <FormInput
              label="First Name"
              LeftIcon={Person}
              value={values.firstname}
              onChangeText={handleChange("firstname")}
              onBlur={handleBlur("firstname")}
              error={touched.firstname && errors.firstname ? errors.firstname : ""}
              placeholder="Enter your first name"
            />

            <FormInput
              label="Last Name"
              LeftIcon={Person}
              value={values.lastname}
              onChangeText={handleChange("lastname")}
              onBlur={handleBlur("lastname")}
              error={touched.lastname && errors.lastname ? errors.lastname : ""}
              placeholder="Enter your last name"
            />

            <FormInput
              label="Email"
              LeftIcon={Email}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              error={touched.email && errors.email ? errors.email : ""}
              keyboardType="email-address"
              placeholder="Enter your email"
              autoCapitalize="none"
            />

            {/* PHONE INPUT */}
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
              maxLength={10}
            />

            {/* PASSWORDS */}
            <FormInput
              label="Password"
              value={values.password}
              isPassword
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              error={touched.password && errors.password ? errors.password : ""}
              placeholder="Enter password"
            />

            <FormInput
              label="Confirm Password"
              value={values.confirmPassword}
              isPassword
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              error={
                touched.confirmPassword && errors.confirmPassword
                  ? errors.confirmPassword
                  : ""
              }
              placeholder="Confirm password"
            />

            {/* ROLE */}
            <FormInput
              label="Role"
              isDropdown
              data={roleOptions}
              value={values.role}
              onDropdownChange={(item) => setFieldValue("role", item.value)}
              error={touched.role && errors.role ? errors.role : ""}
              placeholder="Select your role"
              RightIcon={DropDownIcon}
            />

            {/* DATE PICKER */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    borderColor:
                      touched.dateOfBirth && errors.dateOfBirth
                        ? colors.danger
                        : values.dateOfBirth
                          ? colors.primary
                          : colors.borderGray,
                  },
                ]}
                onPress={() => {
                  setShowPicker(true);
                  setFieldTouched("dateOfBirth", true);
                }}
              >
                <Text style={[styles.dateValue, !values.dateOfBirth && styles.datePlaceholder]}>
                  {values.dateOfBirth
                    ? new Date(values.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Select your date of birth"}
                </Text>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {touched.dateOfBirth && errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
            )}

            {showPicker && (
              <DateTimePicker
                value={
                  values.dateOfBirth
                    ? new Date(values.dateOfBirth)
                    : new Date(2010, 12, 31) // default selected date
                }
                mode="date"
                display="calendar"
                onChange={onDateSelect}
                minimumDate={new Date(1950, 0, 1)} // Jan 1, 1950
                maximumDate={new Date(2010, 11, 31)} // Dec 31, 2010
              />
            )}


            {/* SUBMIT BUTTON */}
            <AppButton
              onPress={() => handleSubmit()}
              disabled={!isValid || isSubmitting}
              containerStyle={[styles.submitButton, (!isValid || isSubmitting) ? styles.submitButtonDisabled : undefined]}
              gradientColors={[colors.primary, "#00D68F"]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign Up</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </AppButton>

            {/* LOGIN LINK */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </FormCard>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 10,
    paddingBottom: 30,
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
  datePickerContainer: {
    marginTop: 15,
  },
  datePickerLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  datePlaceholder: {
    color: colors.gray,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 28,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  loginText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  loginLink: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
});
