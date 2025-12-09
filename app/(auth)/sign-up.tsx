import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Yup from "yup";

import { DropDownIcon, Email, Person } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("+92");
  const [countryFlag, setCountryFlag] = useState("🇵🇰");

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
        const result = await register(payload);
        
        // Navigate to email verification screen after successful registration
        if (result?.requiresVerification) {
          router.replace({
            pathname: "/(auth)/otp-screen",
            params: { email: values.email }
          });
        }
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
  // Phone Number Auto Fix
  // ----------------------
  const handlePhone = (text: string) => {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    setFieldValue("phoneNumber", cleaned);
  };

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
    <SafeAreaView edges={['bottom']} style={{flex:1}}>
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.iconContainer}
        >
          <Ionicons name="medical" size={40} color={colors.white} />
        </LinearGradient>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

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
      <View style={styles.phoneContainer}>
        <Text style={styles.phoneLabel}>Phone Number</Text>

        <View style={styles.phoneInputRow}>
          <TouchableOpacity
            style={styles.countryPickerButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryFlag}>{countryFlag}</Text>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.phoneInputWrapper}>
            <FormInput
            LeftIcon={ <Ionicons name="call-outline" size={20} color={colors.gray} />}
              value={values.phoneNumber}
              onChangeText={handlePhone}
              onBlur={handleBlur("phoneNumber")}
              placeholder="3123456789"
              error={
                touched.phoneNumber && errors.phoneNumber
                  ? errors.phoneNumber
                  : ""
              }
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>
      </View>

      <CountryPicker
        show={showCountryPicker}
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code);
          setCountryFlag(item.flag);
          setShowCountryPicker(false);
        }}
        onBackdropPress={() => setShowCountryPicker(false)}
        lang="en"
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
        : new Date(2010, 12,31) // default selected date
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
        title={isSubmitting ? <ActivityIndicator color="#fff" /> : "Sign Up"}
        onPress={handleSubmit}
        disabled={!isValid || isSubmitting}
        style={styles.submitButton}
      />

      {/* LOGIN LINK */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)")}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    padding: 20,
    // paddingBottom: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.gray,
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
    marginTop: 25,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  phoneContainer: {
    marginTop: 15,
  },
  phoneLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  countryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  phoneInputWrapper: {
    flex: 1,
    marginTop: -15,
  },
});
