import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { colors, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
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
  labId: Yup.string().required("Lab ID is required"),
});

const EditProfile = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      fullName: "Lab Technician",
      email: "lab@healthnest.com",
      phone: "+92 300 1234567",
      labId: "LAB-2024-001",
    },
    validationSchema: profileSchema,
    onSubmit: (values) => {
      console.log("Profile updated:", values);
      router.back();
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit } = formik;

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
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={{ gap: 16, marginTop: 32 }}>
          <FormInput
            value={values.fullName}
            onChangeText={handleChange("fullName")}
            onBlur={handleBlur("fullName")}
            placeholder="Full Name"
            LeftIcon={() => <Ionicons name="person-outline" size={20} color={colors.gray} />}
            error={touched.fullName && errors.fullName ? errors.fullName : undefined}
          />

          <FormInput
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            placeholder="Email"
            keyboardType="email-address"
            LeftIcon={() => <Ionicons name="mail-outline" size={20} color={colors.gray} />}
            error={touched.email && errors.email ? errors.email : undefined}
          />

          <FormInput
            value={values.phone}
            onChangeText={handleChange("phone")}
            onBlur={handleBlur("phone")}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            LeftIcon={() => <Ionicons name="call-outline" size={20} color={colors.gray} />}
            error={touched.phone && errors.phone ? errors.phone : undefined}
          />

          <FormInput
            value={values.labId}
            onChangeText={handleChange("labId")}
            onBlur={handleBlur("labId")}
            placeholder="Lab ID"
            LeftIcon={() => <Ionicons name="flask-outline" size={20} color={colors.gray} />}
            error={touched.labId && errors.labId ? errors.labId : undefined}
          />
        </View>

        {/* Update Button */}
        <AppButton
          title="Update Profile"
          containerStyle={{ marginTop: 32 }}
          onPress={() => handleSubmit()}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
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
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
