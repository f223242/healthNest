import AppButton from "@/component/AppButton";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  fadeAnim: Animated.Value;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, fadeAnim, onCancel, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}> 
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}> 
          <Ionicons name="alert" size={44} color={colors.danger} style={{ marginBottom: 12 }} />
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text style={styles.modalText}>Are you absolutely sure you want to delete your account? This cannot be undone.</Text>
          <View style={styles.modalButtonRow}>
            <AppButton title="Cancel" containerStyle={styles.cancelBtn} textStyle={styles.cancelText} onPress={onCancel} />
            <AppButton title="Delete" containerStyle={styles.confirmBtn} textStyle={styles.confirmText} onPress={onConfirm} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default DeleteAccountModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    width: "85%",
    elevation: 8,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.danger,
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    color: colors.gray,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: 18,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    marginRight: 0,
  },
  confirmBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: colors.primary,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  confirmText: {
    color: colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
});
