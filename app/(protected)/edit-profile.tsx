import { EditProfileIcon, EmailIcon, PhoneIcon, UserIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { colors, sizes } from "@/constant/theme";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const profileSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
});

const EditProfile = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      fullName: "Qasim Ali",
      email: "qasim@example.com",
      phone: "+92 300 1234567",
    },
    validationSchema: profileSchema,
    onSubmit: (values) => {
      // Handle profile update logic
      console.log("Profile updated:", values);
      router.back();
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit } =
    formik;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg",
            }}
            style={styles.imageStyle}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.editIconContainer}>
            <EditProfileIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={{ gap: 16, marginTop: 32 }}>
          <FormInput
            value={values.fullName}
            onChangeText={handleChange("fullName")}
            onBlur={handleBlur("fullName")}
            placeholder="Full Name"
            LeftIcon={UserIcon}
            error={
              touched.fullName && errors.fullName ? errors.fullName : undefined
            }
          />

          <FormInput
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            placeholder="Email"
            keyboardType="email-address"
            LeftIcon={EmailIcon}
            error={touched.email && errors.email ? errors.email : undefined}
          />

          <FormInput
            value={values.phone}
            onChangeText={handleChange("phone")}
            onBlur={handleBlur("phone")}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            LeftIcon={PhoneIcon}
            error={touched.phone && errors.phone ? errors.phone : undefined}
          />
        </View>

        {/* Update Button */}
        <AppButton
          title="Update Profile"
          containerStyle={{ marginTop: 32 }}
          onPress={handleSubmit}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  imageStyle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
