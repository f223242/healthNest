import AppButton from "@/component/AppButton";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import VerificationService, { UserVerification } from "@/services/VerificationService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ImageType = "idFront" | "idBack" | "selfie";

const VerificationScreen = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthContext();
  
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVerification, setExistingVerification] = useState<UserVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Helper functions to get document URLs from documents array
  const getDocumentUrl = (verification: UserVerification | null, type: string): string | undefined => {
    if (!verification?.documents) return undefined;
    const doc = verification.documents.find(d => d.type === type);
    return doc?.imageUrl;
  };

  const getIdFrontUrl = () => getDocumentUrl(existingVerification, "cnic_front");
  const getIdBackUrl = () => getDocumentUrl(existingVerification, "cnic_back");
  const getSelfieUrl = () => getDocumentUrl(existingVerification, "selfie");

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

  // Check for existing verification
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = VerificationService.listenToUserVerification(
      user.uid,
      (verification) => {
        setExistingVerification(verification);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const pickImage = async (type: ImageType) => {
    // For selfie, always use camera
    if (type === "selfie") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast.error("Camera permission is required for selfie");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieImage(result.assets[0].uri);
      }
      return;
    }

    // For ID cards, allow gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Gallery permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === "idFront") {
        setIdFrontImage(result.assets[0].uri);
      } else if (type === "idBack") {
        setIdBackImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!idFrontImage) {
      toast.error("Please upload front side of your ID card");
      return;
    }
    if (!idBackImage) {
      toast.error("Please upload back side of your ID card");
      return;
    }
    if (!selfieImage) {
      toast.error("Please take a selfie for verification");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      await VerificationService.submitVerification(
        user.uid,
        user.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "User",
        user.email || "",
        user.phoneNumber || "",
        idFrontImage,
        idBackImage,
        selfieImage
      );

      toast.success("Verification submitted successfully. Our team will review it shortly.");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "#4CAF50";
      case "rejected": return "#F44336";
      case "pending": return "#FF9800";
      default: return colors.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return "checkmark-circle";
      case "rejected": return "close-circle";
      case "pending": return "time";
      default: return "help-circle";
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  // Show existing verification status
  if (existingVerification) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        
        <LinearGradient
          colors={[colors.primary, '#00C853']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verification Status</Text>
            <View style={{ width: 44 }} />
          </View>
        </LinearGradient>

        <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.statusContainer}>
            {/* Status Card */}
            <View style={[styles.statusCard, { borderColor: getStatusColor(existingVerification.status) }]}>
              <Ionicons
                name={getStatusIcon(existingVerification.status) as any}
                size={64}
                color={getStatusColor(existingVerification.status)}
              />
              <Text style={[styles.statusTitle, { color: getStatusColor(existingVerification.status) }]}>
                {existingVerification.status.toUpperCase()}
              </Text>
              <Text style={styles.statusDescription}>
                {existingVerification.status === "pending"
                  ? "Your verification is being reviewed by our team."
                  : existingVerification.status === "approved"
                  ? "Your identity has been verified successfully!"
                  : "Your verification was rejected."}
              </Text>

              {existingVerification.status === "rejected" && existingVerification.rejectionReason && (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionLabel}>Reason:</Text>
                  <Text style={styles.rejectionText}>{existingVerification.rejectionReason}</Text>
                </View>
              )}
            </View>

            {/* Submitted Documents */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Submitted Documents</Text>
              <View style={styles.documentsGrid}>
                {getIdFrontUrl() && (
                  <TouchableOpacity
                    style={styles.documentPreview}
                    onPress={() => setPreviewImage(getIdFrontUrl() || null)}
                  >
                    <Image source={{ uri: getIdFrontUrl() }} style={styles.documentImage} />
                    <Text style={styles.documentLabel}>ID Front</Text>
                  </TouchableOpacity>
                )}
                {getIdBackUrl() && (
                  <TouchableOpacity
                    style={styles.documentPreview}
                    onPress={() => setPreviewImage(getIdBackUrl() || null)}
                  >
                    <Image source={{ uri: getIdBackUrl() }} style={styles.documentImage} />
                    <Text style={styles.documentLabel}>ID Back</Text>
                  </TouchableOpacity>
                )}
                {getSelfieUrl() && (
                  <TouchableOpacity
                    style={styles.documentPreview}
                    onPress={() => setPreviewImage(getSelfieUrl() || null)}
                  >
                    <Image source={{ uri: getSelfieUrl() }} style={styles.documentImage} />
                    <Text style={styles.documentLabel}>Selfie</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submitted Date */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.gray} />
              <Text style={styles.infoText}>
                Submitted: {existingVerification.createdAt.toDate().toLocaleDateString()}
              </Text>
            </View>

            {existingVerification.status === "rejected" && (
              <AppButton
                title="Resubmit Verification"
                onPress={() => {
                  setExistingVerification(null);
                  setIdFrontImage(null);
                  setIdBackImage(null);
                  setSelfieImage(null);
                }}
                containerStyle={styles.resubmitButton}
              />
            )}
          </ScrollView>
        </SafeAreaView>

        {/* Image Preview Modal */}
        <Modal visible={!!previewImage} transparent animationType="fade">
          <View style={styles.previewModal}>
            <TouchableOpacity style={styles.closePreview} onPress={() => setPreviewImage(null)}>
              <Ionicons name="close-circle" size={40} color={colors.white} />
            </TouchableOpacity>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, '#00C853']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Identity Verification</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Verify your identity to access all features. Upload your ID card photos
                and take a selfie for face matching.
              </Text>
            </View>

            {/* Step 1: ID Card Front */}
            <View style={styles.uploadSection}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>ID Card Front Side</Text>
              </View>
              <TouchableOpacity
                style={[styles.uploadBox, idFrontImage && styles.uploadBoxFilled]}
                onPress={() => pickImage("idFront")}
              >
                {idFrontImage ? (
                  <Image source={{ uri: idFrontImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={48} color={colors.gray} />
                    <Text style={styles.uploadText}>Tap to upload front of ID</Text>
                  </>
                )}
              </TouchableOpacity>
              {idFrontImage && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setIdFrontImage(null)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Step 2: ID Card Back */}
            <View style={styles.uploadSection}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>ID Card Back Side</Text>
              </View>
              <TouchableOpacity
                style={[styles.uploadBox, idBackImage && styles.uploadBoxFilled]}
                onPress={() => pickImage("idBack")}
              >
                {idBackImage ? (
                  <Image source={{ uri: idBackImage }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={48} color={colors.gray} />
                    <Text style={styles.uploadText}>Tap to upload back of ID</Text>
                  </>
                )}
              </TouchableOpacity>
              {idBackImage && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setIdBackImage(null)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Step 3: Selfie */}
            <View style={styles.uploadSection}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepTitle}>Take a Selfie</Text>
              </View>
              <TouchableOpacity
                style={[styles.uploadBox, styles.selfieBox, selfieImage && styles.uploadBoxFilled]}
                onPress={() => pickImage("selfie")}
              >
                {selfieImage ? (
                  <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={48} color={colors.gray} />
                    <Text style={styles.uploadText}>Tap to take a selfie</Text>
                    <Text style={styles.uploadHint}>Camera will open for real-time photo</Text>
                  </>
                )}
              </TouchableOpacity>
              {selfieImage && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setSelfieImage(null)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.removeText}>Retake</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
              <Text style={styles.guidelinesTitle}>📋 Requirements</Text>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>
                  ID card must be valid and not expired
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>
                  All details must be clearly visible
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>
                  Selfie must match the ID photo
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>
                  Good lighting, no blurry images
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <AppButton
              title={isSubmitting ? "Submitting..." : "Submit for Verification"}
              onPress={handleSubmit}
              containerStyle={styles.submitButton}
              disabled={isSubmitting || !idFrontImage || !idBackImage || !selfieImage}
            />
            {isSubmitting && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  statusContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  uploadBox: {
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadBoxFilled: {
    borderStyle: "solid",
    borderColor: colors.primary,
  },
  selfieBox: {
    height: 200,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selfieImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.danger,
  },
  guidelinesCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  submitButton: {
    marginTop: 8,
  },
  // Status screen styles
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    marginTop: 16,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  rejectionBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: "100%",
  },
  rejectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#F44336",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  documentsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  documentPreview: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  documentImage: {
    width: "100%",
    height: 80,
    resizeMode: "cover",
  },
  documentLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.gray,
    textAlign: "center",
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  resubmitButton: {
    marginTop: 16,
  },
  previewModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreview: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  previewImage: {
    width: "90%",
    height: "70%",
  },
});
