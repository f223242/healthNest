import { CalendarIcon, ClockIcon } from "@/assets/svg";
import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import ConfirmationModal from "@/component/ModalComponent/ConfirmationModal";
import PaymentMethodModal from "@/component/ModalComponent/PaymentMethodModal";

import DeliveryPersonCard, { DeliveryPerson } from "@/component/DeliveryPersonCard";
import { DeliveryInfo, useAuthContext, User } from "@/hooks/useFirebaseAuth";
import FeedbackComplaintService from "@/services/FeedbackComplaintService";
import AppointmentService from "@/services/AppointmentService";
import LabTestService from "@/services/LabTestService";
import PaymentService from "@/services/PaymentService";

import { appStyles, colors, Fonts, sizes } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ExpoLocation from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .required("Phone number is required"),
  age: Yup.number()
    .min(1, "Age must be greater than 0")
    .max(120, "Invalid age")
    .required("Age is required"),
  referringDoctor: Yup.string()
    .min(2, "Doctor name must be at least 2 characters"),
  preferredDate: Yup.string().required("Preferred date is required"),
  preferredTime: Yup.string().required("Preferred time is required"),
  notes: Yup.string(),
});

// Home sampling specific schema
const homeSamplingSchema = bookingSchema.concat(
  Yup.object().shape({
    address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Address is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string()
      .matches(/^[0-9]{5,6}$/, "Invalid zip code")
      .required("Zip code is required"),
  })
);

const LabBookingForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { labId, labName, selectedServices } = params;

  const services = selectedServices ? JSON.parse(selectedServices as string) : [];
  const [selectedTestType, setSelectedTestType] = useState<"Home" | "Lab">("Lab");
  const { user, getAllUsers } = useAuthContext();
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [activeAppointments, setActiveAppointments] = useState<Set<string>>(new Set());
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const sanitizePayload = (obj: any) => {
    const cleaned: any = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== undefined && obj[key] !== null) {
        cleaned[key] = obj[key];
      }
    });
    return cleaned;
  };

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

  // Calculate total amount
  const totalAmount = services.reduce(
    (sum: number, s: any) => sum + parseInt(s.price.replace("$", "")),
    0
  ) + (selectedTestType === "Home" ? 15 : 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDateConfirm = (date: Date, setFieldValue: any) => {
    setSelectedDate(date);
    setFieldValue("preferredDate", formatDate(date));
    setDatePickerVisible(false);
  };

  const handleTimeConfirm = (time: Date, setFieldValue: any) => {
    setSelectedTime(time);
    setFieldValue("preferredTime", formatTime(time));
    setTimePickerVisible(false);
  };

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      age: "",
      referringDoctor: "",
      address: "",
      city: "",
      zipCode: "",
      preferredDate: "",
      preferredTime: "",
      notes: "",
    },
    validationSchema: selectedTestType === "Home" ? homeSamplingSchema : bookingSchema,
    onSubmit: () => {
      // Show payment method modal instead of directly confirming
      setShowPaymentModal(true);
    },
  });

  // Listen to user's active lab delivery appointments
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AppointmentService.listenToUserAppointments(
      user.uid,
      (appointments) => {
        const activeDeliveryIds = new Set<string>();
        appointments.forEach((apt) => {
          if (
            apt.providerType === "delivery" &&
            apt.status === "accepted" &&
            apt.deliveryId
          ) {
            activeDeliveryIds.add(apt.deliveryId);
          }
        });
        setActiveAppointments(activeDeliveryIds);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch lab delivery boys from Firebase with dynamic ratings
  const fetchLabDeliveryPersons = React.useCallback(async () => {
    if (selectedTestType !== "Home") return;
    setLoadingDelivery(true);
    try {
      const users = await getAllUsers("Lab Delivery");
      const deliveryData: DeliveryPerson[] = await Promise.all(
        users
          .filter((u: User) => u.profileCompleted && u.additionalInfo)
          .map(async (u: User, index: number) => {
            const info = u.additionalInfo as DeliveryInfo;
            const fullName = `${u.firstname || ""} ${u.lastname || ""}`.trim() || "Lab Delivery Person";

            const isAvailable =
              !info.availability ||
              (info.availability.toLowerCase() !== "unavailable" &&
                info.availability.toLowerCase() !== "part-time");

            let rating = 0;
            let totalDeliveries = 0;
            try {
              const ratingStats = await FeedbackComplaintService.getProviderRatingStats(u.uid);
              rating = ratingStats.averageRating || 0;
              totalDeliveries = ratingStats.totalReviews || 0;
            } catch (err) {
              console.log("No ratings for lab delivery person:", u.uid);
            }

            return {
              id: index + 1,
              name: fullName,
              avatar: info.profileImage || "https://via.placeholder.com/100",
              rating,
              totalDeliveries,
              isAvailable,
              deliveryTime: "15-25 min",
              distance: info.city || "N/A",
              vehicleType: info.vehicleType || "Bike",
              vehicleNumber: info.vehicleNumber || "",
              deliveryType: (u as any).deliveryType || "lab",
              qualification: (u as any).qualification || "",
              uid: u.uid,
            } as DeliveryPerson;
          }),
      );
      setDeliveryPersons(deliveryData);
    } catch (error) {
      console.error("Error fetching lab delivery persons:", error);
    } finally {
      setLoadingDelivery(false);
    }
  }, [getAllUsers, selectedTestType]);

  useEffect(() => {
    if (selectedTestType === "Home") {
      fetchLabDeliveryPersons();
    } else {
      setSelectedDeliveryPerson(null);
    }
  }, [selectedTestType, fetchLabDeliveryPersons]);

  const availableDeliveryPersons = deliveryPersons.filter(
    (p) => p.isAvailable && !activeAppointments.has(p.uid)
  );

  // Get current location for home sampling
  const handleGetCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);

      // Check existing permission first
      const { status: existingStatus } = await ExpoLocation.getForegroundPermissionsAsync();
      
      if (existingStatus !== "granted") {
        // Request permission
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLocationLoading(false);
          alert("Location permission is required for home sampling. Please enable it in settings.");
          return;
        }
      }

      // Get current position
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const [result] = await ExpoLocation.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result) {
        const address = [
          result.streetNumber,
          result.street,
          result.district,
          result.subregion,
        ]
          .filter(Boolean)
          .join(", ");

        const city = result.city || result.subregion || result.region || "";
        const zipCode = result.postalCode || "";

        // Update form values
        formik.setFieldValue("address", address || result.name || "");
        formik.setFieldValue("city", city);
        if (zipCode) {
          formik.setFieldValue("zipCode", zipCode);
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get your location. Please enter address manually.");
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Check if form is valid for current step
  const isFormValid = () => {
    const baseFieldsFilled =
      formik.values.fullName.trim().length >= 2 &&
      formik.values.email.includes("@") &&
      formik.values.phone.length >= 10 &&
      formik.values.age !== "" &&
      formik.values.preferredDate !== "" &&
      formik.values.preferredTime !== "";

    if (selectedTestType === "Home") {
      const addressFieldsFilled = 
        formik.values.address.trim().length >= 10 &&
        formik.values.city.trim() !== "" &&
        formik.values.zipCode.trim().length >= 5;

      if (currentStep === 1) {
        return baseFieldsFilled && addressFieldsFilled;
      } else {
        return baseFieldsFilled && addressFieldsFilled && selectedDeliveryPerson !== null;
      }
    }

    return baseFieldsFilled;
  };

  const handleNextStep = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      if (selectedTestType === "Home" && currentStep === 1) {
        setCurrentStep(2);
      } else {
        // Validation passed, show payment modal
        setShowPaymentModal(true);
      }
    } else {
      // Mark all as touched to show errors
      formik.setTouched({
        fullName: true,
        email: true,
        phone: true,
        age: true,
        preferredDate: true,
        preferredTime: true,
        address: true,
        city: true,
        zipCode: true
      });
    }
  };

  const handlePaymentConfirm = async (paymentMethod: string, paymentDetails?: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentModal(false);

    try {
      const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || formik.values.fullName;
      const testNames = services.map((s: any) => s.name || s.title || s.id);
      const totalAmount = services.reduce(
        (sum: number, s: any) => sum + parseInt((s.price || "0").toString().replace(/[^0-9]/g, "")),
        0
      );

      // Build clean lab test request data
      let labTestData: any = {
        userId: user?.uid || "",
        userName: fullName,
        userPhone: formik.values.phone,
        labId: (labId as string) || "",
        labName: (labName as string) || "",
        testType: testNames.join(", "),
        tests: testNames,
        sampleType: "blood",
        collectionType: selectedTestType === "Home" ? "home_sampling" : "lab_visit",
        scheduledDate: formik.values.preferredDate,
        scheduledTime: formik.values.preferredTime,
        priority: "normal",
        notes: formik.values.notes || "",
        doctorName: formik.values.referringDoctor || "",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "pending" : "paid_to_admin",
      };

      if (selectedTestType === "Home") {
        labTestData.address = `${formik.values.address}, ${formik.values.city} ${formik.values.zipCode}`;
        if (selectedDeliveryPerson) {
          labTestData.deliveryId = selectedDeliveryPerson.uid;
          labTestData.deliveryName = selectedDeliveryPerson.name;
        }
      }

      // Sanitize before any operations
      labTestData = sanitizePayload(labTestData);

      // 1. Process external payment first (if not cash)
      if (paymentMethod !== "cash" && totalAmount > 0) {
        await PaymentService.processPayment(
          user?.uid || "",
          fullName,
          totalAmount,
          paymentMethod as any,
          "lab_test",
          "pending_ref_" + Date.now(), // Temporary ref
          `Lab test booking: ${testNames.join(", ")}`,
          paymentDetails
        );
      }

      // 2. Create the order in Firestore ONLY after payment succeeds
      const testRequestId = await LabTestService.createTestRequest({
        ...labTestData,
        status: "pending"
      } as any);

      // 3. Track in Admin Wallet (Escrow)
      await PaymentService.trackInternalPayment(
        totalAmount,
        "lab_test",
        testRequestId,
        user?.uid || "",
        fullName,
        (labId as string) || "",
        paymentMethod as any
      );

      // 4. Create appointment for delivery boy if home collection
      if (selectedTestType === "Home" && selectedDeliveryPerson) {
        await AppointmentService.createAppointment(sanitizePayload({
          userId: user?.uid || "",
          userName: fullName,
          deliveryId: selectedDeliveryPerson.uid,
          deliveryName: selectedDeliveryPerson.name,
          providerType: "delivery",
          appointmentDate: formik.values.preferredDate,
          appointmentTime: formik.values.preferredTime,
          status: "pending",
          serviceType: "Lab Home Sampling",
          notes: `Lab: ${labName}. Tests: ${testNames.join(", ")}. Order ID: ${testRequestId}`,
          address: labTestData.address || "",
          paymentMethod: paymentMethod as any,
          labTestRequestId: testRequestId,
        }));
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      alert(error.message || "Failed to save booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/(protected)/(tabs)");
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Premium Gradient Header */}
      <LinearGradient
        colors={[colors.primary, "#00C853"]}
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Book Tests</Text>
            {labName && <Text style={styles.headerSubtitle}>{labName}</Text>}
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={22} color="rgba(255,255,255,0.9)" />
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
                {selectedTestType === "Home" && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.serviceName}>Home Collection Fee</Text>
                    <Text style={styles.servicePrice}>$15</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>
                    ${totalAmount}
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

            {/* Conditional Rendering based on Steps */}
            {currentStep === 1 ? (
              <>
                {/* Personal Information */}
                <View style={{ ...styles.section, gap: 8 }}>
                  <Text style={appStyles.sectionTitle}>Personal Information</Text>
                  <FormInput
                    placeholder="Full Name"
                    value={formik.values.fullName}
                    onChangeText={formik.handleChange("fullName")}
                    onBlur={formik.handleBlur("fullName")}
                    error={formik.touched.fullName ? formik.errors.fullName : undefined}
                  />
                  <FormInput
                    placeholder="Email Address"
                    value={formik.values.email}
                    onChangeText={formik.handleChange("email")}
                    onBlur={formik.handleBlur("email")}
                    error={formik.touched.email ? formik.errors.email : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <FormInput
                    placeholder="Phone Number"
                    value={formik.values.phone}
                    onChangeText={formik.handleChange("phone")}
                    onBlur={formik.handleBlur("phone")}
                    error={formik.touched.phone ? formik.errors.phone : undefined}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                  <FormInput
                    placeholder="Age"
                    value={formik.values.age}
                    onChangeText={formik.handleChange("age")}
                    onBlur={formik.handleBlur("age")}
                    error={formik.touched.age ? formik.errors.age : undefined}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>

                {/* Referring Doctor */}
                <View style={{ ...styles.section, gap: 8 }}>
                  <Text style={appStyles.sectionTitle}>Referring Doctor (Optional)</Text>
                  <FormInput
                    placeholder="Enter doctor's name who referred you"
                    value={formik.values.referringDoctor}
                    onChangeText={formik.handleChange("referringDoctor")}
                    onBlur={formik.handleBlur("referringDoctor")}
                    error={formik.touched.referringDoctor ? formik.errors.referringDoctor : undefined}
                  />
                </View>

                {/* Address Information */}
                {selectedTestType === "Home" && (
                  <View style={styles.section}>
                    <View style={styles.addressHeader}>
                      <Text style={appStyles.sectionTitle}>Home Address</Text>
                      <TouchableOpacity 
                        style={styles.locationButton}
                        onPress={handleGetCurrentLocation}
                        disabled={isLocationLoading}
                      >
                        {isLocationLoading ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <>
                            <Ionicons name="location" size={16} color={colors.primary} />
                            <Text style={styles.locationButtonText}>Use Current Location</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    <FormInput
                      placeholder="Street Address"
                      value={formik.values.address}
                      onChangeText={formik.handleChange("address")}
                      onBlur={formik.handleBlur("address")}
                      error={formik.touched.address ? formik.errors.address : undefined}
                      multiline
                    />
                    <View style={styles.row}>
                      <FormInput
                        placeholder="City"
                        value={formik.values.city}
                        onChangeText={formik.handleChange("city")}
                        onBlur={formik.handleBlur("city")}
                        error={formik.touched.city ? formik.errors.city : undefined}
                        containerStyle={styles.halfInput}
                      />
                      <FormInput
                        placeholder="Zip Code"
                        value={formik.values.zipCode}
                        onChangeText={formik.handleChange("zipCode")}
                        onBlur={formik.handleBlur("zipCode")}
                        error={formik.touched.zipCode ? formik.errors.zipCode : undefined}
                        keyboardType="number-pad"
                        containerStyle={styles.halfInput}
                        maxLength={6}
                      />
                    </View>
                  </View>
                )}

                {/* Appointment Schedule */}
                <View style={[styles.section, { gap: 8 }]}>
                  <Text style={appStyles.sectionTitle}>Schedule Appointment</Text>
                  <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                    <FormInput
                      placeholder="Preferred Date (MM/DD/YYYY)"
                      value={formik.values.preferredDate}
                      editable={false}
                      pointerEvents="none"
                      error={formik.touched.preferredDate ? formik.errors.preferredDate : undefined}
                      RightIcon={CalendarIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTimePickerVisible(true)}>
                    <FormInput
                      placeholder="Preferred Time (HH:MM AM/PM)"
                      value={formik.values.preferredTime}
                      editable={false}
                      pointerEvents="none"
                      error={formik.touched.preferredTime ? formik.errors.preferredTime : undefined}
                      RightIcon={ClockIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Additional Notes */}
                <View style={styles.section}>
                  <Text style={appStyles.sectionTitle}>Additional Notes (Optional)</Text>
                  <FormInput
                    placeholder="Any special instructions or medical conditions..."
                    value={formik.values.notes}
                    onChangeText={formik.handleChange("notes")}
                    onBlur={formik.handleBlur("notes")}
                    multiline
                    numberOfLines={10}
                    containerStyle={styles.notesInput}
                  />
                </View>
              </>
            ) : (
              /* Step 2: Delivery Person Selection */
              <View style={styles.section}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back-circle" size={28} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={appStyles.sectionTitle}>Select Delivery Person</Text>
                </View>
                
                {loadingDelivery ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
                ) : availableDeliveryPersons.length === 0 ? (
                  <Text style={{ textAlign: "center", color: colors.grayText, marginTop: 16 }}>
                    No delivery persons available at the moment.
                  </Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {availableDeliveryPersons.map((person) => (
                      <DeliveryPersonCard
                        key={person.uid}
                        {...person}
                        mode="booking"
                        isSelected={selectedDeliveryPerson?.uid === person.uid}
                        onPress={() => setSelectedDeliveryPerson(person)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

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
              title={selectedTestType === "Home" && currentStep === 1 ? "Next: Select Delivery" : "Confirm Booking"}
              onPress={handleNextStep}
              disabled={!isFormValid() || isSubmitting}
              loading={isSubmitting}
            />
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(date) => handleDateConfirm(date, formik.setFieldValue)}
            onCancel={() => setDatePickerVisible(false)}
            minimumDate={new Date()}
            date={selectedDate || new Date()}
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={(time) => handleTimeConfirm(time, formik.setFieldValue)}
            onCancel={() => setTimePickerVisible(false)}
            date={selectedTime || new Date()}
          />

          {/* Payment Method Modal */}
          <PaymentMethodModal
            visible={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={handlePaymentConfirm}
            totalAmount={`$${totalAmount}`}
          />

          {/* Success Confirmation Modal */}
          <ConfirmationModal
            visible={showSuccessModal}
            onClose={handleSuccessClose}
            onConfirm={handleSuccessClose}
            onCancel={handleSuccessClose}
            title="Booking Confirmed!"
            message={`Your lab test booking at ${labName} has been confirmed. We'll send you a confirmation email shortly.`}
            confirmText="Done"
            showCancelButton={false}
            type="success"
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default LabBookingForm;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
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
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: sizes.paddingHorizontal,
    paddingBottom: 20,
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
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.lightGreen,
    borderRadius: 20,
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.primary,
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
