import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, sizes } from "@/constant/theme";
import { AdminInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const profileSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
});

const EditProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, updateProfile, saveAdditionalInfo } = useAuthContext();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      formik.setValues({
        firstName: user.firstname || "",
        lastName: user.lastname || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      });
      setProfileImage(user.additionalInfo?.profileImage || null);
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Update basic profile info
        await updateProfile({
          firstname: values.firstName,
          lastname: values.lastName,
          phoneNumber: values.phone,
        });

        // Update additional info (profile image)
        const adminInfo: AdminInfo = {
          profileImage: profileImage,
          address: (user?.additionalInfo as AdminInfo)?.address || "",
          city: (user?.additionalInfo as AdminInfo)?.city || "",
        };
        await saveAdditionalInfo(adminInfo);

        toast.success("Profile updated successfully!");
        router.back();
      } catch (error: any) {
        toast.error(error.text2 || "Failed to update profile");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit } = formik;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      toast.error("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Image);
    }
  };

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
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.imageStyle}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imageStyle, styles.imagePlaceholder]}>
              <Ionicons name="person" size={48} color={colors.gray} />
            </View>
          )}
          <TouchableOpacity style={styles.editIconContainer} onPress={pickImage}>
            <Ionicons name="camera" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={{ gap: 16, marginTop: 32 }}>
          <FormInput
            value={values.firstName}
            onChangeText={handleChange("firstName")}
            onBlur={handleBlur("firstName")}
            placeholder="First Name"
            LeftIcon={() => <Ionicons name="person-outline" size={20} color={colors.gray} />}
            error={touched.firstName && errors.firstName ? errors.firstName : undefined}
          />

          <FormInput
            value={values.lastName}
            onChangeText={handleChange("lastName")}
            onBlur={handleBlur("lastName")}
            placeholder="Last Name"
            LeftIcon={() => <Ionicons name="person-outline" size={20} color={colors.gray} />}
            error={touched.lastName && errors.lastName ? errors.lastName : undefined}
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
            LeftIcon={() => <Ionicons name="call-outline" size={20} color={colors.gray} />}
            error={touched.phone && errors.phone ? errors.phone : undefined}
          />
        </View>

        {/* Update Button */}
        <AppButton
          title={isLoading ? "Updating..." : "Update Profile"}
          containerStyle={{ marginTop: 32 }}
          onPress={handleSubmit}
          disabled={isLoading}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
        )}
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
  imagePlaceholder: {
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
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
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
