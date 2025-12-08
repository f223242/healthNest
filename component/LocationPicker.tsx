import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PermissionModal from "./PermissionModal";

export interface LocationData {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

interface LocationPickerProps {
  value?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onLocationSelect,
  placeholder = "Select Location",
  error,
  label,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(value?.address || "");
  const [manualCity, setManualCity] = useState(value?.city || "");
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  useEffect(() => {
    if (value) {
      setManualAddress(value.address || "");
      setManualCity(value.city || "");
    }
  }, [value]);

  // Get current location using GPS
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // Check existing permission first
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus !== "granted") {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLoading(false);
          setPermissionModalVisible(true);
          return;
        }
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result) {
        const address = [
          result.streetNumber,
          result.street,
          result.district,
          result.subregion,
        ]
          .filter(Boolean)
          .join(", ");

        const city = result.city || result.subregion || result.region || "";
        const fullAddress = [
          address,
          city,
          result.region,
          result.country,
        ]
          .filter(Boolean)
          .join(", ");

        const locationData: LocationData = {
          address: address || result.name || fullAddress,
          city,
          latitude,
          longitude,
          fullAddress,
        };

        setDetectedLocation(locationData);
        setManualAddress(locationData.address);
        setManualCity(locationData.city);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setPermissionModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Open location in maps app
  const openInMaps = () => {
    if (detectedLocation?.latitude && detectedLocation?.longitude) {
      const lat = detectedLocation.latitude;
      const lng = detectedLocation.longitude;
      const label = encodeURIComponent(detectedLocation.address);
      
      const url = Platform.select({
        ios: `maps:0,0?q=${label}@${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      });
      
      if (url) {
        Linking.openURL(url).catch(() => {
          // Fallback to Google Maps web
          Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
        });
      }
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (!manualAddress.trim()) {
      Alert.alert("Required", "Please enter your address.");
      return;
    }
    if (!manualCity.trim()) {
      Alert.alert("Required", "Please enter your city.");
      return;
    }

    const locationData: LocationData = {
      address: manualAddress.trim(),
      city: manualCity.trim(),
      latitude: detectedLocation?.latitude,
      longitude: detectedLocation?.longitude,
      fullAddress: detectedLocation?.fullAddress || `${manualAddress}, ${manualCity}`,
    };

    onLocationSelect(locationData);
    setModalVisible(false);
  };

  return (
    <>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Location Input Field */}
      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location-outline" size={20} color={colors.gray} />
        </View>
        <Text
          style={[
            styles.inputText,
            !value?.address && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {value?.address ? `${value.address}, ${value.city}` : placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Location Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[colors.primary, "#00D68F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={handleConfirm}>
              <Ionicons name="checkmark" size={24} color={colors.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={getCurrentLocation}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary + "15", colors.primary + "05"]}
                style={styles.currentLocationGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="locate" size={24} color={colors.primary} />
                )}
                <View style={styles.currentLocationText}>
                  <Text style={styles.currentLocationTitle}>
                    Use Current Location
                  </Text>
                  <Text style={styles.currentLocationSubtitle}>
                    Auto-detect your address using GPS
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or enter manually</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <View style={styles.textInputContainer}>
                <Ionicons name="home-outline" size={20} color={colors.gray} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.gray}
                  value={manualAddress}
                  onChangeText={setManualAddress}
                  multiline
                />
              </View>
            </View>

            {/* City Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <View style={styles.textInputContainer}>
                <Ionicons name="business-outline" size={20} color={colors.gray} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your city"
                  placeholderTextColor={colors.gray}
                  value={manualCity}
                  onChangeText={setManualCity}
                />
              </View>
            </View>

            {/* Detected Location Info */}
            {detectedLocation && (
              <View style={styles.detectedContainer}>
                <View style={styles.detectedHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={styles.detectedTitle}>Location Detected</Text>
                </View>
                <Text style={styles.detectedAddress}>
                  {detectedLocation.fullAddress}
                </Text>
                <TouchableOpacity
                  style={styles.viewMapBtn}
                  onPress={openInMaps}
                >
                  <Ionicons name="map-outline" size={16} color={colors.primary} />
                  <Text style={styles.viewMapText}>View on Map</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <LinearGradient
                colors={[colors.primary, "#00D68F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Permission Modal */}
      <PermissionModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onRetry={getCurrentLocation}
        permissionType="location"
      />
    </>
  );
};

export default LocationPicker;

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  inputError: {
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  placeholderText: {
    color: colors.gray,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  currentLocationBtn: {
    marginBottom: 24,
  },
  currentLocationGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  currentLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  currentLocationTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  currentLocationSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGray,
  },
  dividerText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.gray,
    marginHorizontal: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderGray,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.text,
    padding: 0,
    minHeight: 24,
  },
  detectedContainer: {
    backgroundColor: colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  detectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detectedTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  detectedAddress: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  viewMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  viewMapText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: colors.primary,
  },
  confirmButton: {
    marginTop: 8,
  },
  confirmGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
});
