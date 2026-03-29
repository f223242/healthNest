import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

import AppButton from "@/component/AppButton";
import FormCard from "@/component/FormCard";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const { width } = Dimensions.get("window");

// ----------------------
// Matric Type Options
// ----------------------
const matricTypeOptions = [
  { label: "Science", value: "science" },
  { label: "Arts", value: "arts" },
];

// ----------------------
// Yup Validation Schema
// ----------------------
const EducationSchema = Yup.object().shape({
  matricType: Yup.string()
    .required("Matric type is required")
    .oneOf(["science"], "Only Science matric is accepted for Lab Delivery"),
  certificate: Yup.mixed().required("Certificate upload is required"),
});

// ----------------------
// Component
// ----------------------
export default function EducationScreen() {
  const { user, submitEducationDetails, logout } = useAuthContext();
  const { showToast } = useToast();
  const router = useRouter();

  const [pendingUid, setPendingUid] = useState<string | null>(
    user?.uid ?? null,
  );
  const [certificateUri, setCertificateUri] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string>("");

  useEffect(() => {
    const loadPendingUser = async () => {
      if (pendingUid) return;
      const pendingUserRaw = await AsyncStorage.getItem(
        "@healthnest_pending_user",
      );
      if (!pendingUserRaw) return;
      try {
        const pendingUser = JSON.parse(pendingUserRaw);
        if (pendingUser?.uid) {
          setPendingUid(pendingUser.uid);
        }
      } catch {
        // ignore invalid JSON
      }
    };

    loadPendingUser();
  }, [pendingUid]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
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

  // ----------------------
  // Formik Hook
  // ----------------------
  const formik = useFormik({
    initialValues: {
      matricType: "",
      certificate: null as any,
    },
    validationSchema: EducationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!certificateUri) {
          showToast("Please upload your matric certificate", "error");
          return;
        }

        if (values.matricType !== "science") {
          showToast(
            "Only Science matric is accepted for Lab Delivery",
            "error",
          );
          return;
        }

        setSubmitting(true);

        // Upload certificate to Firebase Storage
        const uploadUid = pendingUid || user?.uid;
        if (!uploadUid) {
          throw new Error("User ID not available for education submission");
        }

        const storage = getStorage();
        const certificateRef = ref(
          storage,
          `certificates/${uploadUid}/matric_certificate`,
        );

        // Convert URI to blob
        const response = await fetch(certificateUri);
        const blob = await response.blob();

        // Upload file
        await uploadBytes(certificateRef, blob);

        // Get download URL
        const certificateUrl = await getDownloadURL(certificateRef);

        // Submit education details using auth context
        await submitEducationDetails({
          uid: uploadUid,
          matricType: values.matricType,
          certificateUrl: certificateUrl,
          certificateName: certificateName,
        });

        showToast(
          "Education details submitted successfully! Your account is pending verification.",
          "success",
        );

        await logout();

        // Navigate back to login
        router.replace("/(auth)");
      } catch (error: any) {
        console.error("Education submission error:", error);
        showToast(
          error.message || "Failed to submit education details",
          "error",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    isValid,
    isSubmitting,
  } = formik;

  // ----------------------
  // File Upload Handler
  // ----------------------
  const pickCertificate = async () => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCertificateUri(asset.uri);
        setCertificateName(asset.fileName || `certificate_${Date.now()}`);
        setFieldValue("certificate", asset);
      }
    } catch (error) {
      console.error("File picker error:", error);
      showToast("Failed to pick file", "error");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
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
          <Text style={styles.headerTitle}>Education Verification</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="school" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <FormCard style={styles.formCard}>
              <Text style={styles.description}>
                As a Lab Delivery Boy, you need to provide your Matric
                certificate for verification. Only Science matric certificates
                are accepted.
              </Text>

              {/* Certificate Upload */}
              <View style={styles.uploadSection}>
                <Text style={styles.sectionLabel}>Matric Certificate</Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    certificateUri && styles.uploadButtonSelected,
                  ]}
                  onPress={pickCertificate}
                >
                  <Ionicons
                    name={certificateUri ? "document" : "cloud-upload"}
                    size={32}
                    color={certificateUri ? colors.primary : colors.gray}
                  />
                  <Text
                    style={[
                      styles.uploadText,
                      certificateUri && styles.uploadTextSelected,
                    ]}
                  >
                    {certificateUri
                      ? `Selected: ${certificateName}`
                      : "Tap to upload certificate (Image/PDF)"}
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    Supported formats: JPG, PNG, PDF
                  </Text>
                </TouchableOpacity>
                {touched.certificate && errors.certificate && (
                  <Text style={styles.errorText}>
                    {String(errors.certificate)}
                  </Text>
                )}
              </View>

              {/* Matric Type Dropdown */}
              <View style={styles.dropdownSection}>
                <Text style={styles.sectionLabel}>Matric Type</Text>
                <View style={styles.optionsContainer}>
                  {matricTypeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        values.matricType === option.value &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() => setFieldValue("matricType", option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          values.matricType === option.value &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.matricType && errors.matricType && (
                  <Text style={styles.errorText}>{errors.matricType}</Text>
                )}
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  Your documents will be reviewed by our admin team. You'll
                  receive an email once your account is approved.
                </Text>
              </View>

              {/* Submit Button */}
              <AppButton
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting || !certificateUri}
                containerStyle={[
                  styles.submitButton,
                  (!isValid || isSubmitting || !certificateUri) &&
                    styles.submitButtonDisabled,
                ]}
                gradientColors={[colors.primary, "#00D68F"]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      Submit for Verification
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </AppButton>
            </FormCard>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

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
    paddingTop: 24,
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  uploadButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginTop: 12,
    textAlign: "center",
  },
  uploadTextSelected: {
    color: colors.primary,
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  dropdownSection: {
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.lightGray,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
});
