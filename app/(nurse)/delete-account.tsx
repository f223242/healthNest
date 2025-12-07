import DeleteAccountModal from "@/component/ModalComponent/DeleteAccountModal";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeleteAccount = () => {
  const { logout } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setShowModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
  };

  const handleDeleteConfirm = () => {
    closeModal();
    logout();
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={40} color={colors.danger} />
          </View>
          <Text style={styles.warningTitle}>Delete Your Account?</Text>
          <Text style={styles.warningDescription}>
            This action is permanent and cannot be undone. All your data, including patient records, chat messages, and personal information will be permanently removed.
          </Text>
        </View>

        {/* What You'll Lose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll lose:</Text>
          <View style={styles.itemsList}>
            {[
              { icon: "chatbubbles-outline", text: "All patient conversations" },
              { icon: "document-text-outline", text: "Medical records and notes" },
              { icon: "calendar-outline", text: "Appointment history" },
              { icon: "person-outline", text: "Profile and credentials" },
            ].map((item, index) => (
              <View key={index} style={[styles.listItem, index === 3 && { borderBottomWidth: 0 }]}>
                <View style={styles.listIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={colors.danger} />
                </View>
                <Text style={styles.listText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={openModal}>
          <Ionicons name="trash" size={20} color={colors.white} />
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <DeleteAccountModal
        visible={showModal}
        fadeAnim={fadeAnim}
        onCancel={closeModal}
        onConfirm={handleDeleteConfirm}
      />
    </SafeAreaView>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.danger + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.danger,
    marginBottom: 10,
  },
  warningDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  itemsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray + "50",
  },
  listIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
