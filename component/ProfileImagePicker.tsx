import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ProfileImagePickerProps {
  value?: string | null;
  onImageSelect: (imageUri: string | null) => void;
  size?: number;
  showEditButton?: boolean;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  value,
  onImageSelect,
  size = 100,
  showEditButton = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    setModalVisible(false);
    
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library permissions to select a profile photo.",
          [{ text: "OK" }]
        );
        return;
      }

      setIsLoading(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take a photo.",
          [{ text: "OK" }]
        );
        return;
      }

      setIsLoading(true);

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    setModalVisible(false);
    onImageSelect(null);
  };

  const OptionButton = ({
    icon,
    label,
    onPress,
    color = colors.text,
    iconBg = colors.lightGray,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
    iconBg?: string;
  }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.optionIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.optionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { width: size, height: size }]}
        onPress={() => setModalVisible(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : value ? (
          <Image
            source={{ uri: value }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
          >
            <Ionicons name="person" size={size * 0.4} color={colors.white} />
          </LinearGradient>
        )}

        {/* Edit Button */}
        {showEditButton && !isLoading && (
          <View style={styles.editButton}>
            <LinearGradient
              colors={[colors.primary, "#00D68F"]}
              style={styles.editButtonGradient}
            >
              <Ionicons name="camera" size={14} color={colors.white} />
            </LinearGradient>
          </View>
        )}

        {/* Optional label */}
        {!value && <Text style={styles.label}>Add Photo</Text>}
      </TouchableOpacity>

      {/* Beautiful Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <Text style={styles.modalSubtitle}>Choose how you want to add your photo</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <OptionButton
                icon="camera"
                label="Take Photo"
                onPress={takePhoto}
                iconBg={colors.primary + "15"}
                color={colors.primary}
              />
              <OptionButton
                icon="images"
                label="Choose from Gallery"
                onPress={pickImage}
                iconBg={colors.secondary + "15"}
                color={colors.secondary}
              />
              {value && (
                <OptionButton
                  icon="trash"
                  label="Remove Photo"
                  onPress={removePhoto}
                  iconBg={colors.danger + "15"}
                  color={colors.danger}
                />
              )}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default ProfileImagePicker;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    backgroundColor: colors.lightGray,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  editButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: colors.gray,
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderGray,
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.gray,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    gap: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  cancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 16,
  },
  cancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: colors.gray,
  },
});
