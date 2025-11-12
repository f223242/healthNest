import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import ResetPasswordModal from "@/component/ResetPasswordModal";
import { colors, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import * as Yup from "yup";
import { object } from "yup";

let reset_password_schema = object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
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
});

const ResetPassword = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: reset_password_schema,
    onSubmit: (values) => {
      console.log("Modal visible:", modalVisible);
      setModalVisible(true);
    },
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
    <View style={styles.container}>
      <FormInput
        placeholder="New Password"
        containerStyle={{ marginTop: 20 }}
        isPassword
        onBlur={handleBlur("password")}
        onChangeText={handleChange("password")}
        value={values.password}
        error={
          touched.password && errors.password ? errors.password : undefined
        }
      />

      <FormInput
        placeholder="Confirm Password"
        containerStyle={{ marginTop: 20 }}
        isPassword
        onBlur={handleBlur("confirmPassword")}
        onChangeText={handleChange("confirmPassword")}
        value={values.confirmPassword}
        error={
          touched.confirmPassword && errors.confirmPassword
            ? errors.confirmPassword
            : undefined
        }
      />

      <AppButton
        title="Reset Password"
        onPress={handleSubmit}
        disabled={!isValid || !dirty}
        containerStyle={{ marginTop: 20 }}
      />
      <ResetPasswordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      />
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    backgroundColor: colors.white,
  },
});
