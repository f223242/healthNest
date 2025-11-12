import { Email } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, sizes } from "@/constant/theme";
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
          <Text style={appStyles.h3}>Enter your email</Text>
          <Text style={appStyles.body1}>
            We'll send you a verification code to reset your password.
          </Text>
          <FormInput
            LeftIcon={Email}
            placeholder="Email"
            keyboardType="email-address"
            onBlur={handleBlur("email")}
            onChangeText={handleChange("email")}
            value={values.email}
            containerStyle={{ marginTop: 16 }}
            error={touched.email && errors.email ? errors.email : undefined}
          />
        </View>
        <View>
          <AppButton
            title="Submit"
            disabled={!isValid || !dirty}
            onPress={handleSubmit}
          />
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
});
