import AppButton from "@/component/AppButton";
import FormInput from "@/component/FormInput";
import { useToast } from "@/component/Toast/ToastProvider";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import PaymentService from "@/services/PaymentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BNPLApplicationScreen = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthContext();
  const params = useLocalSearchParams<{
    amount: string;
    entityType: string;
    entityId: string;
    description: string;
  }>();

  const amount = parseFloat(params.amount || "0");
  const [phone, setPhone] = useState("");
  const [installments, setInstallments] = useState(3);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

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

  const installmentOptions = [3, 6, 9, 12];
  
  const calculateInterestRate = (months: number): number => {
    if (months <= 3) return 5;
    if (months <= 6) return 8;
    if (months <= 9) return 12;
    return 15;
  };

  const interestRate = calculateInterestRate(installments);
  const totalAmount = amount + (amount * interestRate) / 100;
  const monthlyPayment = totalAmount / installments;

  const handleSubmit = async () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentService.applyForBNPL(
        user.uid,
        user.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "User",
        user.email || "",
        phone,
        amount,
        installments
      );

      setApplicationSubmitted(true);
    } catch (error) {
      console.error("Error submitting BNPL application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationSubmitted) {
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
            <Text style={styles.headerTitle}>Application Status</Text>
            <View style={{ width: 44 }} />
          </View>
        </LinearGradient>

        <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="hourglass" size={80} color="#FF9800" />
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successMessage}>
              Your Buy Now Pay Later application is under review. We will notify you once it's approved.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Application Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Requested Amount</Text>
                <Text style={styles.summaryValue}>PKR {amount.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Installments</Text>
                <Text style={styles.summaryValue}>{installments} months</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Interest Rate</Text>
                <Text style={styles.summaryValue}>{interestRate}%</Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>Monthly Payment</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  PKR {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </View>
            </View>

            <AppButton
              title="Back to Home"
              onPress={() => router.push("/(protected)/(tabs)")}
              containerStyle={styles.backHomeButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Buy Now Pay Later</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Amount Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount to Finance</Text>
              <Text style={styles.amountValue}>PKR {amount.toLocaleString()}</Text>
            </View>

            {/* Installment Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Installment Plan</Text>
              <View style={styles.installmentsContainer}>
                {installmentOptions.map((months) => (
                  <TouchableOpacity
                    key={months}
                    style={[
                      styles.installmentCard,
                      installments === months && styles.installmentCardActive,
                    ]}
                    onPress={() => setInstallments(months)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.installmentMonths,
                        installments === months && styles.installmentMonthsActive,
                      ]}
                    >
                      {months}
                    </Text>
                    <Text
                      style={[
                        styles.installmentLabel,
                        installments === months && styles.installmentLabelActive,
                      ]}
                    >
                      months
                    </Text>
                    <Text
                      style={[
                        styles.installmentRate,
                        installments === months && styles.installmentRateActive,
                      ]}
                    >
                      {calculateInterestRate(months)}% interest
                    </Text>
                    {installments === months && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemLabel}>Principal Amount</Text>
                  <Text style={styles.summaryItemValue}>PKR {amount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemLabel}>Interest ({interestRate}%)</Text>
                  <Text style={styles.summaryItemValue}>
                    PKR {((amount * interestRate) / 100).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>PKR {totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.monthlyPaymentBox}>
                  <Text style={styles.monthlyLabel}>Monthly Payment</Text>
                  <Text style={styles.monthlyValue}>
                    PKR {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <FormInput
                placeholder="Phone Number (for verification)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                containerStyle={styles.phoneInput}
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                <Text style={styles.termsLink}>BNPL Agreement</Text>
              </Text>
            </TouchableOpacity>

            {/* Important Notes */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>📋 Important Notes</Text>
              <Text style={styles.noteItem}>• Approval is subject to identity verification</Text>
              <Text style={styles.noteItem}>• Late payments may incur additional charges</Text>
              <Text style={styles.noteItem}>• Credit score may be affected by defaults</Text>
              <Text style={styles.noteItem}>• Early repayment option is available</Text>
            </View>

            {/* Submit Button */}
            <AppButton
              title={isSubmitting ? "Submitting..." : "Apply Now"}
              onPress={handleSubmit}
              containerStyle={styles.submitButton}
              disabled={isSubmitting || !agreedToTerms}
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

export default BNPLApplicationScreen;

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
  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "rgba(255,255,255,0.8)",
  },
  amountValue: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginTop: 8,
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
  installmentsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  installmentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderGray,
    position: "relative",
  },
  installmentCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  installmentMonths: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  installmentMonthsActive: {
    color: colors.primary,
  },
  installmentLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 2,
  },
  installmentLabelActive: {
    color: colors.primary,
  },
  installmentRate: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: colors.gray,
    marginTop: 4,
  },
  installmentRateActive: {
    color: colors.primary,
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryItemLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  summaryItemValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGray,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  monthlyPaymentBox: {
    backgroundColor: colors.lightGreen,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  monthlyLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  monthlyValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  phoneInput: {
    marginTop: 0,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: Fonts.medium,
  },
  notesCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
    lineHeight: 22,
  },
  submitButton: {
    marginTop: 8,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: sizes.paddingHorizontal,
    paddingVertical: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
    width: "100%",
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  backHomeButton: {
    marginTop: 32,
    width: "100%",
  },
});
