import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import LocationPicker, { LocationData } from "@/component/LocationPicker";
import ProfileImagePicker from "@/component/ProfileImagePicker";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { DeliveryInfo, useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const profileSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
  vehicleNumber: Yup.string().required("Vehicle number is required"),
  licenseNumber: Yup.string().required("License number is required"),
});

const vehicleTypes = ["Motorcycle", "Car", "Van", "Bicycle"];
const availabilityOptions = ["Full-time", "Part-time", "Weekends Only", "Evenings Only"];

const EditProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, saveAdditionalInfo } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const deliveryInfo = user?.additionalInfo as DeliveryInfo | undefined;

  const [selectedVehicleType, setSelectedVehicleType] = useState(
    deliveryInfo?.vehicleType || ""
  );
  const [selectedAvailability, setSelectedAvailability] = useState(
    deliveryInfo?.availability || ""
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    deliveryInfo?.profileImage || null
  );
  const [location, setLocation] = useState<LocationData | null>(
    deliveryInfo?.address
      ? {
          address: deliveryInfo.address,
          city: deliveryInfo.city || "",
          latitude: deliveryInfo?.coordinates?.latitude,
          longitude: deliveryInfo?.coordinates?.longitude,
        }
      : null
  );

  const formik = useFormik({
    initialValues: {
      fullName: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      vehicleNumber: deliveryInfo?.vehicleNumber || "",
      licenseNumber: deliveryInfo?.licenseNumber || "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await saveAdditionalInfo({
          vehicleType: selectedVehicleType,
          vehicleNumber: values.vehicleNumber,
          licenseNumber: values.licenseNumber,
          availability: selectedAvailability,
          address: location?.address || "",
          city: location?.city || "",
          coordinates: location?.latitude && location?.longitude ? {
            latitude: location.latitude,
            longitude: location.longitude,
          } : null,
          profileImage: profileImage,
        } as DeliveryInfo);
        
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={["#FF6B35", "#FFA07A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="create" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
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
            <View style={{ gap: 16, marginTop: 24 }}>
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

          {/* Vehicle Type Selection */}
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>Vehicle Type</Text>
            <View style={styles.optionsRow}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionChip,
                    selectedVehicleType === type && styles.optionChipSelected,
                  ]}
                  onPress={() => setSelectedVehicleType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedVehicleType === type && styles.optionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FormInput
            value={values.vehicleNumber}
            onChangeText={handleChange("vehicleNumber")}
            onBlur={handleBlur("vehicleNumber")}
            placeholder="Vehicle Number (e.g., ABC-1234)"
            LeftIcon={() => <Ionicons name="car-outline" size={20} color={colors.gray} />}
            error={touched.vehicleNumber && errors.vehicleNumber ? errors.vehicleNumber : undefined}
          />

          <FormInput
            value={values.licenseNumber}
            onChangeText={handleChange("licenseNumber")}
            onBlur={handleBlur("licenseNumber")}
            placeholder="Driving License Number"
            LeftIcon={() => <Ionicons name="card-outline" size={20} color={colors.gray} />}
            error={touched.licenseNumber && errors.licenseNumber ? errors.licenseNumber : undefined}
          />

          {/* Location Picker */}
          <LocationPicker
            label="Home Address"
            value={location || undefined}
            onLocationSelect={setLocation}
            placeholder="Select your home address"
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
              containerStyle={{ marginTop: 32, marginBottom: 20 }}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              )}
            </AppButton>
          </KeyboardAwareScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FF6B35",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingTop: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 8,
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
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
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
