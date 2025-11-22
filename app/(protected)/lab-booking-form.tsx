import { CalendarIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";


const bookingSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  age: Yup.number()
    .min(1, "Age must be greater than 0")
    .max(120, "Invalid age")
    .required("Age is required"),
  address: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .required("Address is required"),
  city: Yup.string().required("City is required"),
  zipCode: Yup.string()
    .matches(/^[0-9]{5,6}$/, "Invalid zip code")
    .required("Zip code is required"),
  preferredDate: Yup.string().required("Preferred date is required"),
  preferredTime: Yup.string().required("Preferred time is required"),
  notes: Yup.string(),
});

const LabBookingForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { labName, selectedServices } = params;

  const services = selectedServices ? JSON.parse(selectedServices as string) : [];
  const [selectedTestType, setSelectedTestType] = useState<"Home" | "Lab">("Lab");

  const handleSubmit = (values: any) => {
    Alert.alert(
      "Booking Confirmed!",
      `Your lab test booking at ${labName} has been confirmed. We'll send you a confirmation email shortly.`,
      [
        {
          text: "OK",
          onPress: () => router.push("/(protected)/(tabs)"),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>

      <Formik
        initialValues={{
          fullName: "",
          email: "",
          phone: "",
          age: "",
          address: "",
          city: "",
          zipCode: "",
          preferredDate: "",
          preferredTime: "",
          notes: "",
        }}
        validationSchema={bookingSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched,isValid,dirty }) => (
          <>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Selected Services Summary */}
              <View style={styles.section}>
                <Text style={appStyles.sectionTitle}>Selected Tests</Text>
                <View style={styles.servicesBox}>
                  {services.map((service: any, index: number) => (
                    <View key={index} style={styles.serviceItem}>
                      <Text style={styles.serviceName}>• {service.name}</Text>
                      <Text style={styles.servicePrice}>{service.price}</Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>
                      $
                      {services.reduce(
                        (sum: number, s: any) => sum + parseInt(s.price.replace("$", "")),
                        0
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Test Type Selection */}
              <View style={styles.section}>
                <Text style={appStyles.sectionTitle}>Test Location</Text>
                <View style={styles.testTypeContainer}>
                  <TouchableOpacity
                    onPress={() => setSelectedTestType("Lab")}
                    style={[
                      styles.testTypeButton,
                      selectedTestType === "Lab" && styles.testTypeButtonActive,
                    ]}
                  >
                    <Text style={styles.testTypeIcon}>🏥</Text>
                    <Text
                      style={[
                        styles.testTypeText,
                        selectedTestType === "Lab" && styles.testTypeTextActive,
                      ]}
                    >
                      Visit Lab
                    </Text>
                    <Text style={styles.testTypeDesc}>Go to lab center</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedTestType("Home")}
                    style={[
                      styles.testTypeButton,
                      selectedTestType === "Home" && styles.testTypeButtonActive,
                    ]}
                  >
                    <Text style={styles.testTypeIcon}>🏠</Text>
                    <Text
                      style={[
                        styles.testTypeText,
                        selectedTestType === "Home" && styles.testTypeTextActive,
                      ]}
                    >
                      Home Collection
                    </Text>
                    <Text style={styles.testTypeDesc}>We come to you (+$15)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Personal Information */}
              <View style={{...styles.section,gap:8}}>
                <Text style={appStyles.sectionTitle}>Personal Information</Text>
                <FormInput
                  placeholder="Full Name"
                  value={values.fullName}
                  onChangeText={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  error={touched.fullName ? errors.fullName : undefined}
                />
                <FormInput
                  placeholder="Email Address"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  error={touched.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FormInput
                  placeholder="Phone Number"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  error={touched.phone ? errors.phone : undefined}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <FormInput
                  placeholder="Age"
                  value={values.age}
                  onChangeText={handleChange("age")}
                  onBlur={handleBlur("age")}
                  error={touched.age ? errors.age : undefined}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              {/* Address Information */}
              {selectedTestType === "Home" && (
                <View style={styles.section}>
                  <Text style={appStyles.sectionTitle}>Home Address</Text>
                  <FormInput
                    placeholder="Street Address"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    error={touched.address ? errors.address : undefined}
                    multiline
                  />
                  <View style={styles.row}>
                    <FormInput
                      placeholder="City"
                      value={values.city}
                      onChangeText={handleChange("city")}
                      onBlur={handleBlur("city")}
                      error={touched.city ? errors.city : undefined}
                      containerStyle={styles.halfInput}
                    />
                    <FormInput
                      placeholder="Zip Code"
                      value={values.zipCode}
                      onChangeText={handleChange("zipCode")}
                      onBlur={handleBlur("zipCode")}
                      error={touched.zipCode ? errors.zipCode : undefined}
                      keyboardType="number-pad"
                      containerStyle={styles.halfInput}
                      maxLength={6}
                    />
                  </View>
                </View>
              )}

              {/* Appointment Schedule */}
              <View style={[styles.section, {gap: 8}]}>
                <Text style={appStyles.sectionTitle}>Schedule Appointment</Text>
                <FormInput
                  placeholder="Preferred Date (MM/DD/YYYY)"
                  value={values.preferredDate}
                  onChangeText={handleChange("preferredDate")}
                  onBlur={handleBlur("preferredDate")}
                  error={touched.preferredDate ? errors.preferredDate : undefined}
                  RightIcon={CalendarIcon}
                />
                <FormInput
                  placeholder="Preferred Time (HH:MM AM/PM)"
                  value={values.preferredTime}
                  onChangeText={handleChange("preferredTime")}
                  onBlur={handleBlur("preferredTime")}
                  error={touched.preferredTime ? errors.preferredTime : undefined}
                />
              </View>

              {/* Additional Notes */}
              <View style={styles.section}>
                <Text style={appStyles.sectionTitle}>Additional Notes (Optional)</Text>
                <FormInput
                  placeholder="Any special instructions or medical conditions..."
                  value={values.notes}
                  onChangeText={handleChange("notes")}
                  onBlur={handleBlur("notes")}
                  multiline
                  numberOfLines={20}
                  containerStyle={styles.notesInput}
                />
              </View>

              {/* Important Information */}
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>⚠️ Important Information</Text>
                <Text style={styles.infoText}>
                  • Fasting may be required for certain tests (8-12 hours)
                </Text>
                <Text style={styles.infoText}>
                  • Bring a valid ID and insurance card if applicable
                </Text>
                <Text style={styles.infoText}>
                  • Arrive 10 minutes before your scheduled time
                </Text>
                <Text style={styles.infoText}>
                  • Results will be available within the specified duration
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
              <AppButton
                title="Confirm Booking"
                onPress={() => handleSubmit()
        
                }
              disabled={!isValid || !dirty}/>
            </View>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default LabBookingForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: Fonts.medium,
  },
  headerTitleContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
  },
  section: {
    marginBottom: 24,
  },
  servicesBox: {
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGray,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  testTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  testTypeButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  testTypeButtonActive: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primary,
  },
  testTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  testTypeText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.gray,
    marginBottom: 4,
  },
  testTypeTextActive: {
    color: colors.primary,
  },
  testTypeDesc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  notesInput: {
    height: 100,
  },
  infoBox: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.yellow,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomContainer: {
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
});
