import DeleteAccountModal from "@/component/ModalComponent/DeleteAccountModal";
import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DeleteAccount = () => {
  const router = useRouter();
  const { logout } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  // Animation refs for content
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

  const openModal = () => {
    setShowModal(true);
    Animated.timing(modalFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalFadeAnim, {
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={["#7C3AED", "#A78BFA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="trash" size={22} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.contentContainer}>
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={40} color={colors.danger} />
          </View>
          <Text style={styles.warningTitle}>Delete Your Account?</Text>
          <Text style={styles.warningDescription}>
            This action is permanent and cannot be undone. All your data, including lab reports, test records, and personal information will be permanently removed.
          </Text>
        </View>

        {/* What You'll Lose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll lose:</Text>
          <View style={styles.itemsList}>
            {[
              { icon: "flask-outline", text: "All test records and history" },
              { icon: "document-text-outline", text: "Generated lab reports" },
              { icon: "analytics-outline", text: "Performance analytics" },
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
      </Animated.View>
    </SafeAreaView>

      <DeleteAccountModal
        visible={showModal}
        fadeAnim={modalFadeAnim}
        onCancel={closeModal}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#7C3AED",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: sizes.paddingHorizontal,
    paddingTop: 30,
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.danger + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.text,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    elevation: 3,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
});
