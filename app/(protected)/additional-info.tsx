import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

// Validation schemas for different roles
const patientSchema = Yup.object({
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  emergencyContact: Yup.string().required("Emergency contact is required"),
  bloodGroup: Yup.string().required("Blood group is required"),
});

const nurseSchema = Yup.object({
  specialization: Yup.string().required("Specialization is required"),
  experience: Yup.string().required("Experience is required"),
  hourlyRate: Yup.string().required("Hourly rate is required"),
  availability: Yup.string().required("Availability is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  certifications: Yup.string().required("Certifications are required"),
});

const labSchema = Yup.object({
  labName: Yup.string().required("Lab name is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  licenseNumber: Yup.string().required("License number is required"),
  homeSampling: Yup.boolean(),
  operatingHours: Yup.string().required("Operating hours are required"),
  servicesOffered: Yup.string().required("Services are required"),
});

const deliverySchema = Yup.object({
  vehicleType: Yup.string().required("Vehicle type is required"),
  vehicleNumber: Yup.string().required("Vehicle number is required"),
  licenseNumber: Yup.string().required("License number is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  availability: Yup.string().required("Availability is required"),
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const vehicleTypes = ["Bike", "Car", "Van", "Bicycle"];
const availabilityOptions = ["Full Time", "Part Time", "Weekends Only", "Flexible"];
const specializations = [
  "General Care",
  "Elderly Care",
  "Child Care",
  "Post-Surgery",
  "ICU Care",
  "Wound Care",
  "Physiotherapy",
];

const AdditionalInfoScreen = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, saveAdditionalInfo } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [homeSampling, setHomeSampling] = useState(false);

  const role = user?.role || "user";

  const getSchema = () => {
    switch (role) {
      case "nurse":
        return nurseSchema;
      case "lab":
        return labSchema;
      case "delivery":
        return deliverySchema;
      default:
        return patientSchema;
    }
  };

  const getInitialValues = () => {
    switch (role) {
      case "nurse":
        return {
          specialization: "",
          experience: "",
          hourlyRate: "",
          availability: "",
          address: "",
          city: "",
          certifications: "",
        };
      case "lab":
        return {
          labName: "",
          address: "",
          city: "",
          licenseNumber: "",
          homeSampling: false,
          operatingHours: "",
          servicesOffered: "",
        };
      case "delivery":
        return {
          vehicleType: "",
          vehicleNumber: "",
          licenseNumber: "",
          address: "",
          city: "",
          availability: "",
        };
      default:
        return {
          address: "",
          city: "",
          emergencyContact: "",
          bloodGroup: "",
        };
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: getSchema(),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Add selected values from dropdowns
        const additionalData: any = { ...values };
        if (role === "user") {
          additionalData.bloodGroup = selectedBloodGroup;
        } else if (role === "nurse") {
          additionalData.specialization = selectedSpecialization;
          additionalData.availability = selectedAvailability;
        } else if (role === "lab") {
          additionalData.homeSampling = homeSampling;
        } else if (role === "delivery") {
          additionalData.vehicleType = selectedVehicle;
          additionalData.availability = selectedAvailability;
        }

        await saveAdditionalInfo(additionalData);
        
        toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your additional information has been saved.",
        });

        // Navigate to main screen based on role
        if (role === "nurse") {
          router.replace("/(nurse)/(tabs)");
        } else if (role === "lab") {
          router.replace("/(lab)/(tabs)");
        } else if (role === "delivery") {
          router.replace("/(delivery)/(tabs)");
        } else {
          router.replace("/(protected)/(tabs)");
        }
      } catch (error: any) {
        toast.show({
          type: "error",
          text1: error.text1 || "Error",
          text2: error.text2 || "Failed to save information. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { handleBlur, handleChange, values, touched, errors, handleSubmit } = formik;

  const getTitle = () => {
    switch (role) {
      case "nurse":
        return "Complete Your Nurse Profile";
      case "lab":
        return "Complete Your Lab Profile";
      case "delivery":
        return "Complete Your Delivery Profile";
      default:
        return "Complete Your Profile";
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case "nurse":
        return "Add your professional details to start receiving care requests";
      case "lab":
        return "Add your lab details to start accepting test bookings";
      case "delivery":
        return "Add your vehicle details to start accepting deliveries";
      default:
        return "Add your health information for better care";
    }
  };

  const renderSelectOption = (
    options: string[],
    selected: string,
    onSelect: (val: string) => void,
    placeholder: string
  ) => (
    <View style={styles.selectContainer}>
      <Text style={styles.selectLabel}>{placeholder}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionChip,
              selected === option && styles.optionChipSelected,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selected === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPatientFields = () => (
    <>
      <FormInput
        value={values.address as string}
        onChangeText={handleChange("address")}
        onBlur={handleBlur("address")}
        placeholder="Home Address"
        LeftIcon={() => (
          <Ionicons name="home-outline" size={20} color={colors.gray} />
        )}
        error={touched.address && errors.address ? String(errors.address) : undefined}
      />

      <FormInput
        value={values.city as string}
        onChangeText={handleChange("city")}
        onBlur={handleBlur("city")}
        placeholder="City"
        LeftIcon={() => (
          <Ionicons name="location-outline" size={20} color={colors.gray} />
        )}
        error={touched.city && errors.city ? String(errors.city) : undefined}
      />

      <FormInput
        value={values.emergencyContact as string}
        onChangeText={handleChange("emergencyContact")}
        onBlur={handleBlur("emergencyContact")}
        placeholder="Emergency Contact Number"
        keyboardType="phone-pad"
        LeftIcon={() => (
          <Ionicons name="call-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.emergencyContact && errors.emergencyContact
            ? String(errors.emergencyContact)
            : undefined
        }
      />

      {renderSelectOption(bloodGroups, selectedBloodGroup, setSelectedBloodGroup, "Blood Group")}
    </>
  );

  const renderNurseFields = () => (
    <>
      {renderSelectOption(
        specializations,
        selectedSpecialization,
        setSelectedSpecialization,
        "Specialization"
      )}

      <FormInput
        value={values.experience as string}
        onChangeText={handleChange("experience")}
        onBlur={handleBlur("experience")}
        placeholder="Years of Experience (e.g., 5 years)"
        LeftIcon={() => (
          <Ionicons name="briefcase-outline" size={20} color={colors.gray} />
        )}
        error={touched.experience && errors.experience ? String(errors.experience) : undefined}
      />

      <FormInput
        value={values.hourlyRate as string}
        onChangeText={handleChange("hourlyRate")}
        onBlur={handleBlur("hourlyRate")}
        placeholder="Hourly Rate (e.g., Rs. 500/hr)"
        keyboardType="numeric"
        LeftIcon={() => (
          <Ionicons name="cash-outline" size={20} color={colors.gray} />
        )}
        error={touched.hourlyRate && errors.hourlyRate ? String(errors.hourlyRate) : undefined}
      />

      {renderSelectOption(
        availabilityOptions,
        selectedAvailability,
        setSelectedAvailability,
        "Availability"
      )}

      <FormInput
        value={values.address as string}
        onChangeText={handleChange("address")}
        onBlur={handleBlur("address")}
        placeholder="Address"
        LeftIcon={() => (
          <Ionicons name="home-outline" size={20} color={colors.gray} />
        )}
        error={touched.address && errors.address ? String(errors.address) : undefined}
      />

      <FormInput
        value={values.city as string}
        onChangeText={handleChange("city")}
        onBlur={handleBlur("city")}
        placeholder="City"
        LeftIcon={() => (
          <Ionicons name="location-outline" size={20} color={colors.gray} />
        )}
        error={touched.city && errors.city ? String(errors.city) : undefined}
      />

      <FormInput
        value={values.certifications as string}
        onChangeText={handleChange("certifications")}
        onBlur={handleBlur("certifications")}
        placeholder="Certifications (comma separated)"
        LeftIcon={() => (
          <Ionicons name="ribbon-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.certifications && errors.certifications
            ? String(errors.certifications)
            : undefined
        }
      />
    </>
  );

  const renderLabFields = () => (
    <>
      <FormInput
        value={values.labName as string}
        onChangeText={handleChange("labName")}
        onBlur={handleBlur("labName")}
        placeholder="Lab Name"
        LeftIcon={() => (
          <Ionicons name="flask-outline" size={20} color={colors.gray} />
        )}
        error={touched.labName && errors.labName ? String(errors.labName) : undefined}
      />

      <FormInput
        value={values.address as string}
        onChangeText={handleChange("address")}
        onBlur={handleBlur("address")}
        placeholder="Lab Address"
        LeftIcon={() => (
          <Ionicons name="home-outline" size={20} color={colors.gray} />
        )}
        error={touched.address && errors.address ? String(errors.address) : undefined}
      />

      <FormInput
        value={values.city as string}
        onChangeText={handleChange("city")}
        onBlur={handleBlur("city")}
        placeholder="City"
        LeftIcon={() => (
          <Ionicons name="location-outline" size={20} color={colors.gray} />
        )}
        error={touched.city && errors.city ? String(errors.city) : undefined}
      />

      <FormInput
        value={values.licenseNumber as string}
        onChangeText={handleChange("licenseNumber")}
        onBlur={handleBlur("licenseNumber")}
        placeholder="License Number"
        LeftIcon={() => (
          <Ionicons name="document-text-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.licenseNumber && errors.licenseNumber
            ? String(errors.licenseNumber)
            : undefined
        }
      />

      <FormInput
        value={values.operatingHours as string}
        onChangeText={handleChange("operatingHours")}
        onBlur={handleBlur("operatingHours")}
        placeholder="Operating Hours (e.g., 9 AM - 9 PM)"
        LeftIcon={() => (
          <Ionicons name="time-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.operatingHours && errors.operatingHours
            ? String(errors.operatingHours)
            : undefined
        }
      />

      <FormInput
        value={values.servicesOffered as string}
        onChangeText={handleChange("servicesOffered")}
        onBlur={handleBlur("servicesOffered")}
        placeholder="Services Offered (comma separated)"
        LeftIcon={() => (
          <Ionicons name="list-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.servicesOffered && errors.servicesOffered
            ? String(errors.servicesOffered)
            : undefined
        }
      />

      {/* Home Sampling Toggle */}
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => setHomeSampling(!homeSampling)}
      >
        <View style={styles.toggleLeft}>
          <Ionicons name="car-outline" size={20} color={colors.gray} />
          <Text style={styles.toggleText}>Home Sampling Available</Text>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            homeSampling && styles.toggleSwitchActive,
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              homeSampling && styles.toggleThumbActive,
            ]}
          />
        </View>
      </TouchableOpacity>
    </>
  );

  const renderDeliveryFields = () => (
    <>
      {renderSelectOption(
        vehicleTypes,
        selectedVehicle,
        setSelectedVehicle,
        "Vehicle Type"
      )}

      <FormInput
        value={values.vehicleNumber as string}
        onChangeText={handleChange("vehicleNumber")}
        onBlur={handleBlur("vehicleNumber")}
        placeholder="Vehicle Number"
        autoCapitalize="characters"
        LeftIcon={() => (
          <Ionicons name="car-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.vehicleNumber && errors.vehicleNumber
            ? String(errors.vehicleNumber)
            : undefined
        }
      />

      <FormInput
        value={values.licenseNumber as string}
        onChangeText={handleChange("licenseNumber")}
        onBlur={handleBlur("licenseNumber")}
        placeholder="Driving License Number"
        LeftIcon={() => (
          <Ionicons name="card-outline" size={20} color={colors.gray} />
        )}
        error={
          touched.licenseNumber && errors.licenseNumber
            ? String(errors.licenseNumber)
            : undefined
        }
      />

      <FormInput
        value={values.address as string}
        onChangeText={handleChange("address")}
        onBlur={handleBlur("address")}
        placeholder="Address"
        LeftIcon={() => (
          <Ionicons name="home-outline" size={20} color={colors.gray} />
        )}
        error={touched.address && errors.address ? String(errors.address) : undefined}
      />

      <FormInput
        value={values.city as string}
        onChangeText={handleChange("city")}
        onBlur={handleBlur("city")}
        placeholder="City"
        LeftIcon={() => (
          <Ionicons name="location-outline" size={20} color={colors.gray} />
        )}
        error={touched.city && errors.city ? String(errors.city) : undefined}
      />

      {renderSelectOption(
        availabilityOptions,
        selectedAvailability,
        setSelectedAvailability,
        "Availability"
      )}
    </>
  );

  const renderFields = () => {
    switch (role) {
      case "nurse":
        return renderNurseFields();
      case "lab":
        return renderLabFields();
      case "delivery":
        return renderDeliveryFields();
      default:
        return renderPatientFields();
    }
  };

  const getIcon = () => {
    switch (role) {
      case "nurse":
        return "medkit-outline";
      case "lab":
        return "flask-outline";
      case "delivery":
        return "bicycle-outline";
      default:
        return "person-outline";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons name={getIcon() as any} size={40} color={colors.white} />
          </LinearGradient>
          <Text style={[appStyles.h3, styles.title]}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>{renderFields()}</View>

        {/* Submit Button */}
        <AppButton
          title={isSubmitting ? "Saving..." : "Save & Continue"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          containerStyle={styles.submitButton}
        >
          {isSubmitting && (
            <ActivityIndicator
              color="#fff"
              size="small"
              style={{ marginRight: 8 }}
            />
          )}
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdditionalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    gap: 16,
  },
  selectContainer: {
    marginBottom: 8,
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderGray,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  submitButton: {
    marginTop: 30,
  },
});
