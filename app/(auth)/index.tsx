import { Email, Lock } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useAuthContext } from "@/hooks/useContext";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { object, string } from "yup";

let email_schema = object({
  email: string().required("Email is required").email("Invalid email"),
  password: string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const index = () => {
  const { login } = useAuthContext();
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: (value) => login(value),
    validationSchema: email_schema,
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
          <Image
            source={require("@/assets/png/logo.png")}
            style={{
              width: 150,
              height: 150,
              alignSelf: "center",
              marginVertical: 20,
            }}
          />
          <Text style={[appStyles.h3, styles.headingStyle]}>Welcome Back</Text>
          <Text
            style={{ textAlign: "center", ...appStyles.body1, marginTop: 8 }}
          >
            Please enter your credentials to access your account.
          </Text>
          <FormInput
            LeftIcon={Email}
            placeholder="Email"
            keyboardType="email-address"
            onBlur={handleBlur("email")}
            onChangeText={handleChange("email")}
            value={values.email}
            containerStyle={{ marginTop: 12 }}
            error={touched.email && errors.email ? errors.email : undefined}
            // editable={!isLoading}
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
            // editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={[styles.forgotPasswordStyle]}
            // disabled={isLoading}
          >
            <Text style={{ color: colors.primary }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View>
          <AppButton
            title="Login"
            disabled={!isValid || !dirty}
            onPress={handleSubmit}
            // loading={isLoading}
          />
          <View style={styles.bottomTextStyle}>
            <Text style={appStyles.body1}>
              Don't have an account?<Text>{`  `}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              // disabled={isLoading}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingStyle: {
    textAlign: "center",
    marginTop: 20,
  },
  bottomTextStyle: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  forgotPasswordStyle: {
    alignSelf: "flex-end",
    marginVertical: 10,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
});
