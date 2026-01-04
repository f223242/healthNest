import AppButton from "@/component/AppButton";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import PaymentService, { PaymentMethod, TEST_CARDS } from "@/services/PaymentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EntityType = "appointment" | "lab_test" | "medicine" | "subscription" | "other";

const PaymentCheckoutScreen = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthContext();
  const params = useLocalSearchParams<{
    amount: string;
    entityType: EntityType;
    entityId: string;
    description: string;
  }>();

  const amount = parseFloat(params.amount || "0");
  const entityType = (params.entityType as EntityType) || "other";
  const entityId = params.entityId || "";
  const description = params.description || "Payment";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    message: string;
    transactionId: string;
  } | null>(null);

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

  const paymentMethods: { label: string; value: PaymentMethod; icon: string }[] = [
    { label: "Debit/Credit Card", value: "card", icon: "card-outline" },
    { label: "Buy Now Pay Later", value: "bnpl", icon: "calendar-outline" },
    { label: "Cash on Delivery", value: "cash", icon: "cash-outline" },
  ];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    setCardNumber(cleaned);
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(cleaned);
  };

  const useTestCard = (type: "success" | "decline" | "insufficientFunds") => {
    const card = TEST_CARDS[type];
    setCardNumber(card.number);
    setCardName(card.name);
    setCardExpiry(card.expiry.replace("/", ""));
    setCardCvv(card.cvv);
    setShowTestCards(false);
  };

  const validateCard = () => {
    if (cardNumber.length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return false;
    }
    if (!cardName.trim()) {
      toast.error("Please enter cardholder name");
      return false;
    }
    if (cardExpiry.length !== 4) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return false;
    }
    if (cardCvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (paymentMethod === "card" && !validateCard()) {
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === "bnpl") {
        // Navigate to BNPL application
        router.push({
          pathname: "/(protected)/bnpl-application",
          params: { amount: amount.toString(), entityType, entityId, description },
        });
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "cash") {
        // Cash on delivery - just confirm booking
        toast.success("Order placed! Pay when you receive the service.");
        setTimeout(() => router.back(), 1500);
        setIsProcessing(false);
        return;
      }

      // Process card payment
      const result = await PaymentService.processPayment(
        user.uid,
        user.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "User",
        amount,
        paymentMethod,
        entityType,
        entityId,
        description,
        {
          number: cardNumber,
          name: cardName,
          expiry: formatExpiry(cardExpiry),
          cvv: cardCvv,
        }
      );

      setTransactionResult(result);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    if (transactionResult?.success) {
      router.back();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, "#00C853"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Test Mode Banner */}
            <View style={styles.testModeBanner}>
              <Ionicons name="flask" size={20} color="#FF9800" />
              <Text style={styles.testModeText}>Test Mode - No real charges</Text>
              <TouchableOpacity onPress={() => setShowTestCards(true)}>
                <Text style={styles.testCardsLink}>Use Test Cards</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>PKR {amount.toLocaleString()}</Text>
              <Text style={styles.amountDescription}>{description}</Text>
            </View>

            {/* Payment Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.methodsContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.methodCard,
                      paymentMethod === method.value && styles.methodCardActive,
                    ]}
                    onPress={() => setPaymentMethod(method.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={24}
                      color={paymentMethod === method.value ? colors.white : colors.primary}
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === method.value && styles.methodTextActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                    {paymentMethod === method.value && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                <View style={styles.cardForm}>
                  {/* Card Number */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={colors.gray}
                        value={formatCardNumber(cardNumber)}
                        onChangeText={handleCardNumberChange}
                        keyboardType="number-pad"
                        maxLength={19}
                      />
                      <Ionicons name="card" size={20} color={colors.gray} />
                    </View>
                  </View>

                  {/* Cardholder Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={colors.gray}
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Expiry and CVV */}
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Expiry Date</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YY"
                          placeholderTextColor={colors.gray}
                          value={formatExpiry(cardExpiry)}
                          onChangeText={handleExpiryChange}
                          keyboardType="number-pad"
                          maxLength={5}
                        />
                      </View>
                    </View>
                    <View style={{ width: 16 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="123"
                          placeholderTextColor={colors.gray}
                          value={cardCvv}
                          onChangeText={(t) => setCardCvv(t.replace(/\D/g, "").slice(0, 4))}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                        />
                        <Ionicons name="lock-closed" size={18} color={colors.gray} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* BNPL Info */}
            {paymentMethod === "bnpl" && (
              <View style={styles.bnplInfo}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <View style={styles.bnplTextContainer}>
                  <Text style={styles.bnplTitle}>Buy Now, Pay Later</Text>
                  <Text style={styles.bnplDescription}>
                    Split your payment into easy monthly installments. Subject to approval.
                  </Text>
                </View>
              </View>
            )}

            {/* Cash Info */}
            {paymentMethod === "cash" && (
              <View style={styles.cashInfo}>
                <Ionicons name="cash" size={24} color="#4CAF50" />
                <View style={styles.bnplTextContainer}>
                  <Text style={styles.bnplTitle}>Cash on Delivery</Text>
                  <Text style={styles.bnplDescription}>
                    Pay in cash when you receive the service. Additional convenience charges may apply.
                  </Text>
                </View>
              </View>
            )}

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.securityText}>
                Your payment information is secure and encrypted
              </Text>
            </View>

            {/* Pay Button */}
            <AppButton
              title={
                isProcessing
                  ? "Processing..."
                  : paymentMethod === "bnpl"
                  ? "Apply for BNPL"
                  : paymentMethod === "cash"
                  ? "Place Order"
                  : `Pay PKR ${amount.toLocaleString()}`
              }
              onPress={handlePayment}
              containerStyle={styles.payButton}
              disabled={isProcessing}
            />
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.processingText}>Processing payment...</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Test Cards Modal */}
      <Modal visible={showTestCards} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.testCardsModal}>
            <Text style={styles.modalTitle}>Test Cards</Text>
            <Text style={styles.modalSubtitle}>Use these cards for testing</Text>

            <TouchableOpacity style={styles.testCardItem} onPress={() => useTestCard("success")}>
              <View style={[styles.testCardBadge, { backgroundColor: "#4CAF50" }]}>
                <Text style={styles.testCardBadgeText}>Success</Text>
              </View>
              <Text style={styles.testCardNumber}>4242 4242 4242 4242</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testCardItem} onPress={() => useTestCard("decline")}>
              <View style={[styles.testCardBadge, { backgroundColor: "#F44336" }]}>
                <Text style={styles.testCardBadgeText}>Decline</Text>
              </View>
              <Text style={styles.testCardNumber}>4000 0000 0000 0002</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testCardItem} onPress={() => useTestCard("insufficientFunds")}>
              <View style={[styles.testCardBadge, { backgroundColor: "#FF9800" }]}>
                <Text style={styles.testCardBadgeText}>No Funds</Text>
              </View>
              <Text style={styles.testCardNumber}>4000 0000 0000 9995</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowTestCards(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success/Failure Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <Ionicons
              name={transactionResult?.success ? "checkmark-circle" : "close-circle"}
              size={80}
              color={transactionResult?.success ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.resultTitle}>
              {transactionResult?.success ? "Payment Successful!" : "Payment Failed"}
            </Text>
            <Text style={styles.resultMessage}>{transactionResult?.message}</Text>
            {transactionResult?.transactionId && (
              <Text style={styles.transactionId}>
                Transaction ID: {transactionResult.transactionId.slice(0, 20)}...
              </Text>
            )}
            <AppButton
              title={transactionResult?.success ? "Done" : "Try Again"}
              onPress={handleCloseSuccess}
              containerStyle={styles.resultButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentCheckoutScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
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
  testModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  testModeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: "#E65100",
  },
  testCardsLink: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  amountCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  amountValue: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: colors.primary,
    marginTop: 8,
  },
  amountDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
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
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  methodCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  methodTextActive: {
    color: colors.white,
  },
  cardForm: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
    paddingVertical: 14,
  },
  inputRow: {
    flexDirection: "row",
  },
  bnplInfo: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  cashInfo: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  bnplTextContainer: {
    flex: 1,
  },
  bnplTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 4,
  },
  bnplDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  payButton: {
    marginTop: 8,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  processingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  testCardsModal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.black,
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  testCardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  testCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  testCardBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  testCardNumber: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
    letterSpacing: 1,
  },
  closeModalButton: {
    marginTop: 8,
    padding: 12,
  },
  closeModalText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
    textAlign: "center",
  },
  resultModal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginTop: 16,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  transactionId: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 16,
    textAlign: "center",
  },
  resultButton: {
    marginTop: 24,
    width: "100%",
  },
});
