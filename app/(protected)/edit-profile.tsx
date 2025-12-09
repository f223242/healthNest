import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { PatientInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const profileSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  emergencyContact: Yup.string().required("Emergency contact is required"),
  bloodGroup: Yup.string().required("Blood group is required"),
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, saveAdditionalInfo } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(
    (user?.additionalInfo as PatientInfo)?.bloodGroup || ""
  );

  const patientInfo = user?.additionalInfo as PatientInfo | undefined;

  const formik = useFormik({
    initialValues: {
      fullName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      address: patientInfo?.address || "",
      city: patientInfo?.city || "",
      emergencyContact: patientInfo?.emergencyContact || "",
      bloodGroup: patientInfo?.bloodGroup || "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await saveAdditionalInfo({
          address: values.address,
          city: values.city,
          emergencyContact: values.emergencyContact,
          bloodGroup: selectedBloodGroup || values.bloodGroup,
        } as PatientInfo);
        
        toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been updated successfully.",
        });
        router.back();
      } catch (error: any) {
        toast.show({
          type: "error",
          text1: error.text1 || "Error",
          text2: error.text2 || "Failed to update profile.",
        });
      } finally {
        setIsSubmitting(false);
      }
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
            editable={false}
            LeftIcon={() => <Ionicons name="person-outline" size={20} color={colors.gray} />}
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
            editable={false}
            LeftIcon={() => <Ionicons name="mail-outline" size={20} color={colors.gray} />}
            error={touched.email && errors.email ? errors.email : undefined}
          />

          <FormInput
            value={values.phone}
            onChangeText={handleChange("phone")}
            onBlur={handleBlur("phone")}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            editable={false}
            LeftIcon={() => <Ionicons name="call-outline" size={20} color={colors.gray} />}
            error={touched.phone && errors.phone ? errors.phone : undefined}
          />

          <FormInput
            value={values.address}
            onChangeText={handleChange("address")}
            onBlur={handleBlur("address")}
            placeholder="Home Address"
            LeftIcon={() => <Ionicons name="home-outline" size={20} color={colors.gray} />}
            error={touched.address && errors.address ? errors.address : undefined}
          />

          <FormInput
            value={values.city}
            onChangeText={handleChange("city")}
            onBlur={handleBlur("city")}
            placeholder="City"
            LeftIcon={() => <Ionicons name="location-outline" size={20} color={colors.gray} />}
            error={touched.city && errors.city ? errors.city : undefined}
          />

          <FormInput
            value={values.emergencyContact}
            onChangeText={handleChange("emergencyContact")}
            onBlur={handleBlur("emergencyContact")}
            placeholder="Emergency Contact"
            keyboardType="phone-pad"
            LeftIcon={() => <Ionicons name="call-outline" size={20} color={colors.gray} />}
            error={touched.emergencyContact && errors.emergencyContact ? errors.emergencyContact : undefined}
          />

          {/* Blood Group Selection */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Blood Group</Text>
            <View style={styles.optionsRow}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.optionChip,
                    selectedBloodGroup === group && styles.optionChipSelected,
                  ]}
                  onPress={() => setSelectedBloodGroup(group)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedBloodGroup === group && styles.optionTextSelected,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Update Button */}
        <AppButton
          title={isSubmitting ? "Updating..." : "Update Profile"}
          containerStyle={{ marginTop: 32 }}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
          )}
        </AppButton>
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
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: colors.white,
  },
  selectContainer: {
    marginTop: 8,
  },
  selectLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.lightGray,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
  },
});
