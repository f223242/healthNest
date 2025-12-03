import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AppButton from "./AppButton";

type PaymentMethod = "cash" | "card" | "wallet" | "insurance";

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  totalAmount: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "cash",
    title: "Cash on Visit/Delivery",
    subtitle: "Pay when sample is collected",
    icon: "cash-outline",
    iconColor: "#4CAF50",
  },
  {
    id: "card",
    title: "Credit/Debit Card",
    subtitle: "Pay securely with your card",
    icon: "card-outline",
    iconColor: "#2196F3",
  },
  {
    id: "wallet",
    title: "Digital Wallet",
    subtitle: "JazzCash, Easypaisa, etc.",
    icon: "wallet-outline",
    iconColor: "#FF9800",
  },
  {
    id: "insurance",
    title: "Health Insurance",
    subtitle: "Use your insurance coverage",
    icon: "shield-checkmark-outline",
    iconColor: "#9C27B0",
  },
];

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  visible,
  onClose,
  onConfirm,
  totalAmount,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Payment Method</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Amount Summary */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{totalAmount}</Text>
          </View>

          {/* Payment Options */}
          <ScrollView
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {paymentOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedMethod === option.id && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedMethod(option.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.iconColor + "15" },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.iconColor}
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedMethod === option.id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedMethod === option.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="lock-closed" size={14} color={colors.gray} />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted
            </Text>
          </View>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <AppButton
              title="Confirm Payment Method"
              onPress={handleConfirm}
              disabled={!selectedMethod}
            />
          </View>
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
    maxHeight: "80%",
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
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
  optionSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
});
