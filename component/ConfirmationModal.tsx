import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type ModalVariant = "danger" | "success" | "warning" | "info" | "primary";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  iconContainerStyle?: ViewStyle;
}

const getVariantColors = (variant: ModalVariant) => {
  switch (variant) {
    case "danger":
      return { primary: colors.danger, background: colors.danger + "20" };
    case "success":
      return { primary: colors.primary, background: colors.primary + "20" };
    case "warning":
      return { primary: "#FF9800", background: "#FF980020" };
    case "info":
      return { primary: "#2196F3", background: "#2196F320" };
    case "primary":
    default:
      return { primary: colors.primary, background: colors.primary + "20" };
  }
};

const getDefaultIcon = (variant: ModalVariant): keyof typeof Ionicons.glyphMap => {
  switch (variant) {
    case "danger":
      return "alert-circle-outline";
    case "success":
      return "checkmark-circle-outline";
    case "warning":
      return "warning-outline";
    case "info":
      return "information-circle-outline";
    case "primary":
    default:
      return "help-circle-outline";
  }
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  variant = "primary",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancelButton = true,
  iconContainerStyle,
}) => {
  const variantColors = getVariantColors(variant);
  const displayIcon = icon || getDefaultIcon(variant);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: variantColors.background },
              iconContainerStyle,
            ]}
          >
            <Ionicons name={displayIcon} size={50} color={variantColors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: variantColors.primary },
                !showCancelButton && { flex: 1 },
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  confirmButton: {},
  confirmText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
