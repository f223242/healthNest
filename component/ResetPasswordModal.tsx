import { appStyles, colors, Fonts } from "@/constant/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ResetPasswordModal = ({ visible, onClose }: any) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Password Reset Successful!</Text>
          <Text
            style={{
              textAlign: "center",
              ...appStyles.body1,
            }}
          >
            Your password has been successfully reset. You can now log in with
            your new password.
          </Text>

          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ResetPasswordModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 50,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginBottom: 20,
  },
  button: {
    marginTop: 15,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
