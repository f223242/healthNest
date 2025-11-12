import { Email, Lock, Person } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, sizes } from "@/constant/theme";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
});

const SignUpScreen = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      lastname: "",
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
        <View style={{ marginTop: 45 }}>
          <FormInput
            LeftIcon={Person}
            placeholder="First Name"
            keyboardType="default"
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
            onBlur={handleBlur("lastname")}
            onChangeText={handleChange("lastname")}
            value={values.lastname}
            containerStyle={{ marginTop: 12 }}
            error={
              touched.lastname && errors.lastname ? errors.lastname : undefined
            }
          />
          <FormInput
            LeftIcon={Email}
            placeholder="Email"
            keyboardType="email-address"
            onBlur={handleBlur("email")}
            onChangeText={handleChange("email")}
            value={values.email}
            containerStyle={{ marginTop: 12 }}
            error={touched.email && errors.email ? errors.email : undefined}
          />
          <FormInput
            LeftIcon={Lock}
            placeholder="Password"
            isPassword
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
        <View>
          <AppButton title="Register" disabled={!isValid || !dirty} />
          <View style={styles.bottomTextStyle}>
            <Text style={appStyles.body1}>
              Already have an account?
              <Text>{`  `}</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  bottomTextStyle: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  logoStyle: {},
});
