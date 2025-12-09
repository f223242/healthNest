import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type PermissionType = "camera" | "gallery" | "location";

interface PermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry?: () => void;
  permissionType: PermissionType;
}

const permissionConfig = {
  camera: {
    icon: "camera",
    title: "Camera Access Required",
    description:
      "We need access to your camera to take profile photos. This helps personalize your experience and makes it easier for healthcare providers to identify you.",
    benefits: [
      "Take instant profile photos",
      "Quick document scanning",
      "Better identification",
    ],
  },
  gallery: {
    icon: "images",
    title: "Photo Library Access",
    description:
      "We need access to your photo library to select a profile picture. Your photos stay private and secure on your device.",
    benefits: [
      "Choose from existing photos",
      "Select the perfect picture",
      "Easy profile customization",
    ],
  },
  location: {
    icon: "location",
    title: "Location Access Needed",
    description:
      "We need your location to connect you with nearby healthcare services, labs, and delivery personnel for faster service.",
    benefits: [
      "Find nearby services",
      "Accurate delivery tracking",
      "Faster emergency response",
    ],
  },
};

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onClose,
  onRetry,
  permissionType,
}) => {
  const config = permissionConfig[permissionType];

  const openSettings = () => {
    onClose();
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={config.icon as any} size={40} color={colors.white} />
          </LinearGradient>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{config.description}</Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {config.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={openSettings}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.settingsButtonGradient}
              >
                <Ionicons name="settings-outline" size={20} color={colors.white} />
                <Text style={styles.settingsButtonText}>Open Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            {onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  onClose();
                  onRetry();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color={colors.primary} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PermissionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsContainer: {
    width: "100%",
    backgroundColor: colors.primary + "08",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  settingsButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  settingsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  settingsButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  retryButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: colors.primary + "10",
    borderRadius: 14,
    gap: 8,
  },
  retryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  laterButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.gray,
  },
});
