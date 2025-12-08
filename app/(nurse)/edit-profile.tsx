import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import LocationPicker, { LocationData } from "@/component/LocationPicker";
import ProfileImagePicker from "@/component/ProfileImagePicker";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { NurseInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const profileSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
  specialization: Yup.string().required("Specialization is required"),
  experience: Yup.string().required("Experience is required"),
  hourlyRate: Yup.string().required("Hourly rate is required"),
  certifications: Yup.string().required("Certifications are required"),
});

const availabilityOptions = ["Full-time", "Part-time", "On-call", "Weekends Only"];

const EditProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, saveAdditionalInfo } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nurseInfo = user?.additionalInfo as NurseInfo | undefined;

  const [selectedAvailability, setSelectedAvailability] = useState(
    nurseInfo?.availability || ""
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    nurseInfo?.profileImage || null
  );
  const [location, setLocation] = useState<LocationData | null>(
    nurseInfo?.address
      ? {
          address: nurseInfo.address,
          city: nurseInfo.city || "",
          latitude: nurseInfo?.coordinates?.latitude,
          longitude: nurseInfo?.coordinates?.longitude,
        }
      : null
  );

  const formik = useFormik({
    initialValues: {
      fullName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      specialization: nurseInfo?.specialization || "",
      experience: nurseInfo?.experience || "",
      hourlyRate: nurseInfo?.hourlyRate || "",
      certifications: nurseInfo?.certifications || "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await saveAdditionalInfo({
          specialization: values.specialization,
          experience: values.experience,
          hourlyRate: values.hourlyRate,
          availability: selectedAvailability,
          certifications: values.certifications,
          address: location?.address || "",
          city: location?.city || "",
          coordinates: location?.latitude && location?.longitude ? {
            latitude: location.latitude,
            longitude: location.longitude,
          } : null,
          profileImage: profileImage,
        } as NurseInfo);
        
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
          <ProfileImagePicker
            value={profileImage}
            onImageSelect={setProfileImage}
            size={120}
          />
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
            value={values.specialization}
            onChangeText={handleChange("specialization")}
            onBlur={handleBlur("specialization")}
            placeholder="Specialization (e.g., ICU, Pediatric)"
            LeftIcon={() => <Ionicons name="medical-outline" size={20} color={colors.gray} />}
            error={touched.specialization && errors.specialization ? errors.specialization : undefined}
          />

          <FormInput
            value={values.experience}
            onChangeText={handleChange("experience")}
            onBlur={handleBlur("experience")}
            placeholder="Experience (e.g., 5 years)"
            LeftIcon={() => <Ionicons name="time-outline" size={20} color={colors.gray} />}
            error={touched.experience && errors.experience ? errors.experience : undefined}
          />

          <FormInput
            value={values.hourlyRate}
            onChangeText={handleChange("hourlyRate")}
            onBlur={handleBlur("hourlyRate")}
            placeholder="Hourly Rate (e.g., Rs. 500/hr)"
            keyboardType="numeric"
            LeftIcon={() => <Ionicons name="cash-outline" size={20} color={colors.gray} />}
            error={touched.hourlyRate && errors.hourlyRate ? errors.hourlyRate : undefined}
          />

          <FormInput
            value={values.certifications}
            onChangeText={handleChange("certifications")}
            onBlur={handleBlur("certifications")}
            placeholder="Certifications (e.g., RN, BSN)"
            LeftIcon={() => <Ionicons name="ribbon-outline" size={20} color={colors.gray} />}
            error={touched.certifications && errors.certifications ? errors.certifications : undefined}
          />

          {/* Location Picker */}
          <LocationPicker
            label="Service Area Address"
            value={location || undefined}
            onLocationSelect={setLocation}
            placeholder="Select your service area"
          />

          {/* Availability Selection */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Availability</Text>
            <View style={styles.optionsRow}>
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionChip,
                    selectedAvailability === option && styles.optionChipSelected,
                  ]}
                  onPress={() => setSelectedAvailability(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAvailability === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
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
