import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import PaymentService from "@/services/PaymentService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppButton from "../AppButton";

type PaymentMethod = "cash" | "card" | "jazzcash" | "easypaisa" | "bank" | "pay_later";

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

// Pay Later verification data
export interface PayLaterVerificationData {
  cnicNumber: string;
  cnicFrontImage: string;
  cnicBackImage: string;
  selfieImage: string;
  emergencyContact: string;
  employerName: string;
}


interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, paymentDetails?: any) => void;
  totalAmount: string;
}

type ModalStep = "select" | "card_details" | "mobile_wallet" | "bank_transfer" | "pay_later_form";

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  visible,
  onClose,
  onConfirm,
  totalAmount,
}) => {
  const { user } = useAuthContext();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [currentStep, setCurrentStep] = useState<ModalStep>("select");
  const [isBNPLApproved, setIsBNPLApproved] = useState(false);
  const [isBNPLCheckLoading, setIsBNPLCheckLoading] = useState(true);
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  // Mobile wallet
  const [mobileNumber, setMobileNumber] = useState("");
  
  // Pay later verification
  const [cnicNumber, setCnicNumber] = useState("");
  const [cnicFrontImage, setCnicFrontImage] = useState<string | null>(null);
  const [cnicBackImage, setCnicBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Check if user has approved BNPL application
  useEffect(() => {
    const checkBNPLStatus = async () => {
      if (!user?.uid) {
        setIsBNPLCheckLoading(false);
        return;
      }
      
      try {
        const applications = await PaymentService.getUserBNPLApplications(user.uid);
        // Check if any application is approved or active
        const hasApprovedBNPL = applications.some(
          (app: any) => app.status === "approved" || app.status === "active"
        );
        setIsBNPLApproved(hasApprovedBNPL);
      } catch (error) {
        console.error("Error checking BNPL status:", error);
        setIsBNPLApproved(false);
      } finally {
        setIsBNPLCheckLoading(false);
      }
    };

    if (visible) {
      checkBNPLStatus();
    }
  }, [visible, user?.uid]);

  const paymentOptions: PaymentOption[] = [
    {
      id: "cash",
      title: "Cash on Visit",
      subtitle: "Pay when sample is collected",
      icon: <MaterialCommunityIcons name="cash" size={26} color="#4CAF50" />,
      iconBgColor: "#4CAF50",
    },
    {
      id: "card",
      title: "Credit/Debit Card",
      subtitle: "Visa, Mastercard, UnionPay",
      icon: <MaterialCommunityIcons name="credit-card-outline" size={26} color="#1976D2" />,
      iconBgColor: "#1976D2",
    },
    {
      id: "jazzcash",
      title: "JazzCash",
      subtitle: "Pay via JazzCash mobile wallet",
      icon: <Text style={styles.walletIconText}>🎵</Text>,
      iconBgColor: "#E31937",
    },
    {
      id: "easypaisa",
      title: "Easypaisa",
      subtitle: "Pay via Easypaisa mobile wallet",
      icon: <Text style={styles.walletIconText}>💚</Text>,
      iconBgColor: "#00A651",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      subtitle: "Direct bank transfer",
      icon: <MaterialCommunityIcons name="bank-outline" size={26} color="#5C6BC0" />,
      iconBgColor: "#5C6BC0",
    },
    {
      id: "pay_later",
      title: "Pay Later",
      subtitle: "Verify & pay after test completion",
      icon: <MaterialCommunityIcons name="clock-outline" size={26} color="#FF9800" />,
      iconBgColor: "#FF9800",
    },
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    
    switch (method) {
      case "cash":
        break;
      case "card":
        setCurrentStep("card_details");
        break;
      case "jazzcash":
      case "easypaisa":
        setCurrentStep("mobile_wallet");
        break;
      case "bank":
        setCurrentStep("bank_transfer");
        break;
      case "pay_later":
        setCurrentStep("pay_later_form");
        break;
    }
  };

  const handleConfirm = () => {
    if (selectedMethod === "cash") {
      onConfirm(selectedMethod);
    } else if (selectedMethod === "card") {
      onConfirm(selectedMethod, { cardNumber, cardExpiry, cardName });
    } else if (selectedMethod === "jazzcash" || selectedMethod === "easypaisa") {
      onConfirm(selectedMethod, { mobileNumber });
    } else if (selectedMethod === "bank") {
      onConfirm(selectedMethod);
    } else if (selectedMethod === "pay_later") {
      onConfirm(selectedMethod, { 
        cnicNumber, 
        cnicFrontImage,
        cnicBackImage,
        selfieImage,
        emergencyContact, 
        employerName 
      } as PayLaterVerificationData);
    }
    resetModal();
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setCurrentStep("select");
    setCardNumber("");
    setCardExpiry("");
    setCvv("");
    setCardName("");
    setMobileNumber("");
    setCnicNumber("");
    setCnicFrontImage(null);
    setCnicBackImage(null);
    setSelfieImage(null);
    setEmergencyContact("");
    setEmployerName("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBack = () => {
    setCurrentStep("select");
    setSelectedMethod(null);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const formatCNIC = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 5 && cleaned.length <= 12) {
      return cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    } else if (cleaned.length > 12) {
      return cleaned.slice(0, 5) + "-" + cleaned.slice(5, 12) + "-" + cleaned.slice(12, 13);
    }
    return cleaned;
  };

  const isCardValid = cardNumber.replace(/\s/g, "").length === 16 && 
                      cardExpiry.length === 5 && 
                      cardCvv.length >= 3 && 
                      cardName.length >= 2;

  const isMobileValid = mobileNumber.length >= 11;

  const isPayLaterValid = cnicNumber.replace(/-/g, "").length === 13 && 
                          cnicFrontImage !== null &&
                          cnicBackImage !== null &&
                          selfieImage !== null &&
                          emergencyContact.length >= 11 && 
                          employerName.length >= 2;

  // Image picker functions for Pay Later
  const pickImage = async (type: "cnic_front" | "cnic_back" | "selfie") => {
    try {
      setIsUploadingImage(true);
      
      if (type === "selfie") {
        // For selfie, use camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Camera permission is required for selfie capture");
          setIsUploadingImage(false);
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
      } else {
        // For CNIC, use gallery
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Gallery permission is required to upload CNIC");
          setIsUploadingImage(false);
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.8,
        });
        
        if (!result.canceled && result.assets[0]) {
          if (type === "cnic_front") {
            setCnicFrontImage(result.assets[0].uri);
          } else {
            setCnicBackImage(result.assets[0].uri);
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const renderPaymentOptions = () => (
    <>
      <ScrollView
        contentContainerStyle={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {paymentOptions.map((option) => {
          // Check if BNPL (pay_later) option should be disabled
          const isBNPLOption = option.id === "pay_later";
          const isDisabled = isBNPLOption && !isBNPLApproved;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedMethod === option.id && styles.optionCardSelected,
                isDisabled && styles.optionCardDisabled,
              ]}
              activeOpacity={isDisabled ? 1 : 0.7}
              onPress={() => {
                if (isDisabled) {
                  Alert.alert(
                    "BNPL Not Approved",
                    "Your Buy Now Pay Later application has not been approved yet. Please apply for BNPL in your profile settings or wait for admin approval.",
                    [{ text: "OK" }]
                  );
                  return;
                }
                handleMethodSelect(option.id);
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.iconBgColor + "15" },
                  isDisabled && { opacity: 0.5 },
                ]}
              >
                {option.icon}
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, isDisabled && styles.optionTitleDisabled]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionSubtitle, isDisabled && styles.optionSubtitleDisabled]}>
                  {isDisabled ? "Not approved - Apply in Profile" : option.subtitle}
                </Text>
              </View>
              {isDisabled ? (
                <Ionicons name="lock-closed" size={20} color={colors.gray} />
              ) : (
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={selectedMethod === option.id ? colors.primary : colors.gray} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedMethod === "cash" && (
        <View style={styles.buttonContainer}>
          <AppButton
            title="Confirm Cash Payment"
            onPress={handleConfirm}
          />
        </View>
      )}
    </>
  );

  const renderCardDetails = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Card Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.cardIcons}>
        <Image 
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" }}
          style={styles.cardBrandIcon}
          resizeMode="contain"
        />
        <Image 
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" }}
          style={styles.cardBrandIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={colors.gray}
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            placeholderTextColor={colors.gray}
            value={cardExpiry}
            onChangeText={(text) => setCardExpiry(formatExpiry(text))}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            placeholderTextColor={colors.gray}
            value={cardCvv}
            onChangeText={setCvv}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name on card"
          placeholderTextColor={colors.gray}
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.secureNote}>
        <Ionicons name="lock-closed" size={16} color={colors.primary} />
        <Text style={styles.secureText}>Your card details are encrypted and secure</Text>
      </View>

      <AppButton
        title={`Pay ${totalAmount}`}
        onPress={handleConfirm}
        disabled={!isCardValid}
      />
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderMobileWallet = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>
          {selectedMethod === "jazzcash" ? "JazzCash" : "Easypaisa"} Payment
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.walletBanner, { backgroundColor: selectedMethod === "jazzcash" ? "#E31937" + "15" : "#00A651" + "15" }]}>
        <Text style={[styles.walletBannerText, { color: selectedMethod === "jazzcash" ? "#E31937" : "#00A651" }]}>
          {selectedMethod === "jazzcash" ? "🎵 JazzCash" : "💚 Easypaisa"}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="03XX XXXXXXX"
          placeholderTextColor={colors.gray}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
          maxLength={11}
        />
      </View>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>How to pay:</Text>
        <Text style={styles.instructionText}>1. Enter your registered mobile number</Text>
        <Text style={styles.instructionText}>2. You'll receive a payment request</Text>
        <Text style={styles.instructionText}>3. Open your {selectedMethod === "jazzcash" ? "JazzCash" : "Easypaisa"} app</Text>
        <Text style={styles.instructionText}>4. Approve the payment request</Text>
      </View>

      <AppButton
        title={`Pay ${totalAmount} via ${selectedMethod === "jazzcash" ? "JazzCash" : "Easypaisa"}`}
        onPress={handleConfirm}
        disabled={!isMobileValid}
      />
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderBankTransfer = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Bank Transfer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.bankDetailsBox}>
        <Text style={styles.bankDetailsTitle}>Transfer to this account:</Text>
        
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Bank Name:</Text>
          <Text style={styles.bankDetailValue}>HBL (Habib Bank Limited)</Text>
        </View>
        
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Account Title:</Text>
          <Text style={styles.bankDetailValue}>HealthNest Pvt Ltd</Text>
        </View>
        
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Account Number:</Text>
          <View style={styles.copyRow}>
            <Text style={styles.bankDetailValue}>1234-5678-9012-3456</Text>
            <TouchableOpacity style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>IBAN:</Text>
          <View style={styles.copyRow}>
            <Text style={styles.bankDetailValue}>PK12HABB1234567890123456</Text>
            <TouchableOpacity style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bankDetailRow}>
          <Text style={styles.bankDetailLabel}>Amount:</Text>
          <Text style={[styles.bankDetailValue, { color: colors.primary, fontFamily: Fonts.bold }]}>{totalAmount}</Text>
        </View>
      </View>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>📸 Upload Payment Proof:</Text>
        <Text style={styles.instructionText}>After transfer, upload screenshot for verification</Text>
      </View>

      <TouchableOpacity style={styles.uploadBtn}>
        <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
        <Text style={styles.uploadBtnText}>Upload Screenshot</Text>
      </TouchableOpacity>

      <AppButton
        title="Confirm Transfer"
        onPress={handleConfirm}
      />
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderPayLaterForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>Pay Later Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.payLaterBanner}>
        <Ionicons name="information-circle" size={20} color="#FF9800" />
        <Text style={styles.payLaterBannerText}>
          Pay after your test is completed. Identity verification is required.
        </Text>
      </View>

      {/* CNIC Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CNIC Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="12345-1234567-1"
          placeholderTextColor={colors.gray}
          value={cnicNumber}
          onChangeText={(text) => setCnicNumber(formatCNIC(text))}
          keyboardType="number-pad"
          maxLength={15}
        />
      </View>

      {/* CNIC Front Image */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CNIC Front Photo *</Text>
        <TouchableOpacity 
          style={[styles.imageUploadBox, cnicFrontImage && styles.imageUploadBoxFilled]}
          onPress={() => pickImage("cnic_front")}
          disabled={isUploadingImage}
        >
          {cnicFrontImage ? (
            <Image source={{ uri: cnicFrontImage }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={styles.imageUploadText}>Tap to upload CNIC front</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* CNIC Back Image */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CNIC Back Photo *</Text>
        <TouchableOpacity 
          style={[styles.imageUploadBox, cnicBackImage && styles.imageUploadBoxFilled]}
          onPress={() => pickImage("cnic_back")}
          disabled={isUploadingImage}
        >
          {cnicBackImage ? (
            <Image source={{ uri: cnicBackImage }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={styles.imageUploadText}>Tap to upload CNIC back</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Live Selfie */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Live Selfie *</Text>
        <TouchableOpacity 
          style={[styles.imageUploadBox, selfieImage && styles.imageUploadBoxFilled]}
          onPress={() => pickImage("selfie")}
          disabled={isUploadingImage}
        >
          {selfieImage ? (
            <Image source={{ uri: selfieImage }} style={styles.uploadedImageSelfie} />
          ) : (
            <>
              <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
              <Text style={styles.imageUploadText}>Tap to take live selfie</Text>
              <Text style={styles.imageUploadSubtext}>Camera will open</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Emergency Contact */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Emergency Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="03XX XXXXXXX"
          placeholderTextColor={colors.gray}
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          keyboardType="phone-pad"
          maxLength={11}
        />
      </View>

      {/* Employer Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Employer / Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your employer or business name"
          placeholderTextColor={colors.gray}
          value={employerName}
          onChangeText={setEmployerName}
        />
      </View>

      {/* Verification Notice */}
      <View style={styles.verificationNotice}>
        <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
        <Text style={styles.verificationNoticeText}>
          Your identity will be verified by our secure third-party verification partner. Admin approval is required after verification.
        </Text>
      </View>

      <View style={styles.termsBox}>
        <Ionicons name="checkbox" size={20} color={colors.primary} />
        <Text style={styles.termsText}>
          I agree to pay {totalAmount} within 7 days after test completion. Late payment may incur additional charges.
        </Text>
      </View>

      {isUploadingImage && (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.uploadingText}>Processing...</Text>
        </View>
      )}

      <AppButton
        title="Submit for Verification"
        onPress={handleConfirm}
        disabled={!isPayLaterValid || isUploadingImage}
      />
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentStep) {
      case "select":
        return renderPaymentOptions();
      case "card_details":
        return renderCardDetails();
      case "mobile_wallet":
        return renderMobileWallet();
      case "bank_transfer":
        return renderBankTransfer();
      case "pay_later_form":
        return renderPayLaterForm();
      default:
        return renderPaymentOptions();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          {currentStep === "select" && (
            <View style={styles.header}>
              <Text style={styles.title}>Select Payment Method</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
          )}

          {/* Amount Summary */}
          {currentStep === "select" && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>{totalAmount}</Text>
            </View>
          )}

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  amountContainer: {
    backgroundColor: colors.primary + "10",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  amountValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  optionCardDisabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  walletIconText: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 2,
  },
  optionTitleDisabled: {
    color: colors.gray,
  },
  optionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  optionSubtitleDisabled: {
    color: "#AAAAAA",
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  formTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  cardIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  cardBrandIcon: {
    width: 50,
    height: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  row: {
    flexDirection: "row",
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  secureText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  walletBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  walletBannerText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  instructionBox: {
    backgroundColor: "#F0F7FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 4,
  },
  bankDetailsBox: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  bankDetailsTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  bankDetailRow: {
    marginBottom: 10,
  },
  bankDetailLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 2,
  },
  bankDetailValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyBtn: {
    padding: 4,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary + "10",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    marginBottom: 16,
  },
  uploadBtnText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  payLaterBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  payLaterBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#E65100",
  },
  termsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0F7FF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
  // Image upload styles for Pay Later
  imageUploadBox: {
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary + "40",
    borderStyle: "dashed",
    backgroundColor: colors.primary + "08",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageUploadBoxFilled: {
    borderStyle: "solid",
    borderColor: colors.success,
    padding: 0,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadedImageSelfie: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  imageUploadSubtext: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  verificationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.primary + "10",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  verificationNoticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.primary,
    lineHeight: 18,
  },
  uploadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  uploadingText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
