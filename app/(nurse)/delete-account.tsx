import AppButton from "@/component/AppButton";
import DeleteAccountModal from "@/component/ModalComponent/DeleteAccountModal";
import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeleteAccountScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const confirmDelete = () => {
    hideModal();
    // Add delete logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Ionicons name="trash" size={48} color={colors.danger} style={styles.icon} />
        <Text style={styles.title}>Delete Account</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.warningText}>
          Warning: This action is permanent and cannot be undone.
        </Text>
        <Text style={styles.infoText}>
          All your data will be removed from HealthNest. Please confirm if you wish to proceed.
        </Text>
      </View>
      <AppButton title="Delete My Account" containerStyle={styles.deleteButton} textStyle={styles.deleteButtonText} onPress={showModal} />

      <DeleteAccountModal
        visible={modalVisible}
        fadeAnim={fadeAnim}
        onCancel={hideModal}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: "center",
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: colors.danger,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: colors.danger + "15",
    borderRadius: 16,
    padding: 18,
    marginBottom: 32,
    alignItems: "center",
  },
  warningText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.danger,
    marginBottom: 8,
    textAlign: "center",
  },
  infoText: {
    fontSize: 15,
    color: colors.gray,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: "center",
    elevation: 2,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
