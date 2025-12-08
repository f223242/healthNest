import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  countryCode: string;
  countryFlag: string;
  onCountryChange: (code: string, flag: string) => void;
  maxLength?: number;
  containerStyle?: ViewStyle;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label = "Phone Number",
  value,
  onChangeText,
  onBlur,
  error,
  placeholder = "3123456789",
  countryCode,
  countryFlag,
  onCountryChange,
  maxLength = 10,
  containerStyle,
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Clean and format phone number
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    onChangeText(cleaned);
  };

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused || value) return colors.primary;
    return colors.borderGray;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputRow}>
        {/* Country Code Button */}
        <TouchableOpacity
          style={[styles.countryButton, { borderColor: getBorderColor() }]}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.countryFlag}>{countryFlag}</Text>
          <Text style={styles.countryCode}>{countryCode}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Phone Number Input */}
        <View
          style={[
            styles.inputContainer,
            { borderColor: getBorderColor() },
          ]}
        >
          <Ionicons name="call-outline" size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handlePhoneChange}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            placeholderTextColor={colors.gray}
            keyboardType="numeric"
            maxLength={maxLength}
          />
        </View>
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Picker Modal */}
      <CountryPicker
        show={showCountryPicker}
        lang="en"
        pickerButtonOnPress={(item) => {
          onCountryChange(item.dial_code, item.flag);
          setShowCountryPicker(false);
        }}
        onBackdropPress={() => setShowCountryPicker(false)}
        style={{
          modal: {
            height: 500,
          },
        }}
      />
    </View>
  );
};

export default PhoneInput;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    gap: 6,
    borderWidth: 1,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 4,
    marginLeft: 4,
  },
});
