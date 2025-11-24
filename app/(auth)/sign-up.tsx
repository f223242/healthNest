import { CalendarIconBlack, DropDownIcon, Email, Lock, Person } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import { object } from "yup";

let email_schema = object({
  email: Yup.string().required("email is required").email("Invalid email"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
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
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  role: Yup.string()
    .required("Role is required")
    .oneOf(["User", "Lab", "Nurse", "Medicine Delivery"], "Invalid role selected"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
});

const SignUpScreen = () => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const roles = [
    { label: "User", value: "User" },
    { label: "Lab", value: "Lab" },
    { label: "Nurse", value: "Nurse" },
    { label: "Medicine Delivery", value: "Medicine Delivery" },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      lastname: "",
      role: "",
      dateOfBirth: "",
    },
    onSubmit: (value) => console.log(" value", value),
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
              <Ionicons name="person-add-outline" size={52} color={colors.white} />
            </LinearGradient>
          </View>

          <Text style={[appStyles.h3, { textAlign: "center", marginBottom: 8 }]}>
            Create Account
          </Text>
          <Text style={styles.subheadingStyle}>
            Sign up to start your health journey
          </Text>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={currentStep === 1 ? styles.progressDotActive : styles.progressDot}>
                <Text style={currentStep === 1 ? styles.progressNumberActive : styles.progressNumber}>1</Text>
              </View>
              <Text style={currentStep === 1 ? styles.progressLabelActive : styles.progressLabel}>Personal</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={currentStep === 2 ? styles.progressDotActive : styles.progressDot}>
                <Text style={currentStep === 2 ? styles.progressNumberActive : styles.progressNumber}>2</Text>
              </View>
              <Text style={currentStep === 2 ? styles.progressLabelActive : styles.progressLabel}>Account</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <FormInput
              LeftIcon={Person}
              placeholder="First Name"
              keyboardType="default"
              onFocus={() => setCurrentStep(1)}
              onBlur={handleBlur("firstname")}
              onChangeText={handleChange("firstname")}
              value={values.firstname}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.firstname && errors.firstname
                  ? errors.firstname
                  : undefined
              }
            />
            <FormInput
              LeftIcon={Person}
              placeholder="Last Name"
              keyboardType="default"
              onFocus={() => setCurrentStep(1)}
              onBlur={handleBlur("lastname")}
              onChangeText={handleChange("lastname")}
              value={values.lastname}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.lastname && errors.lastname ? errors.lastname : undefined
              }
            />

            {/* Role Selection Dropdown */}
            <FormInput
              isDropdown
              data={roles}
              placeholder="Select Role"
              value={values.role}
              onDropdownChange={(item) => {
                formik.setFieldValue("role", item.value);
              }}
              LeftIcon={Person}
              RightIcon={DropDownIcon}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.role && errors.role ? errors.role : undefined
              }
            />

            {/* Date of Birth */}
            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
              <FormInput
                RightIcon={CalendarIconBlack}
                placeholder="Date of Birth"
                value={values.dateOfBirth}
                editable={false}
                pointerEvents="none"
                containerStyle={{ marginTop: 12 }}
                error={
                  touched.dateOfBirth && errors.dateOfBirth
                    ? errors.dateOfBirth
                    : undefined
                }
              />
            </TouchableOpacity>

            {/* Account Section */}
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.sectionLabel}>Account Details</Text>
              <View style={styles.dividerLine} />
            </View>

            <FormInput
              LeftIcon={Email}
              placeholder="Email"
              keyboardType="email-address"
              onFocus={() => setCurrentStep(2)}
              onBlur={handleBlur("email")}
              onChangeText={handleChange("email")}
              value={values.email}
              containerStyle={{ marginTop: 12 }}
              error={touched.email && errors.email ? errors.email : undefined}
              autoCapitalize="none"
            />
            <FormInput
              LeftIcon={Lock}
              placeholder="Password"
              isPassword
              onFocus={() => setCurrentStep(2)}
              onBlur={handleBlur("password")}
              onChangeText={handleChange("password")}
              value={values.password}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.password && errors.password ? errors.password : undefined
              }
            />

            <FormInput
              LeftIcon={Lock}
              placeholder="Confirm Password"
              isPassword
              onFocus={() => setCurrentStep(2)}
              onBlur={handleBlur("confirmPassword")}
              onChangeText={handleChange("confirmPassword")}
              value={values.confirmPassword}
              containerStyle={{ marginTop: 12 }}
              error={
                touched.confirmPassword && errors.confirmPassword
                  ? errors.confirmPassword
                  : undefined
              }
            />
          </View>
        </View>
        
        <View>
          <AppButton 
            title="Create Account" 
            disabled={!isValid || !dirty}
            onPress={handleSubmit}
            containerStyle={{marginTop:20}}
          />
          <View style={styles.bottomTextStyle}>
            <Text style={[appStyles.body1, { color: colors.gray }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)")}>  
              <Text style={styles.signInText}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setSelectedDate(date);
          formik.setFieldValue("dateOfBirth", formatDate(date));
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
        date={selectedDate || new Date()}
      />
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  gradientCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  subheadingStyle: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.gray,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDotActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  progressNumberActive: {
    color: colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  progressNumber: {
    color: colors.gray,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  progressLabelActive: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 8,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGray,
  },
  sectionLabel: {
    marginHorizontal: 12,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.gray,
  },
  bottomTextStyle: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    fontSize: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginBottom: 20,
  },
});
