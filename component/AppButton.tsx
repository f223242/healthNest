import { colors } from "@/constant/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
type Props = {
  title: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
};

const AppButton = ({
  title,
  containerStyle,
  textStyle,
  onPress,
  disabled,
}: Props) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[styles.buttonStyle, disabled && styles.disableButtonStyle]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonTextStyle, styles.buttonText]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppButton;
const styles = StyleSheet.create({
  buttonStyle: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  buttonTextStyle: {
    color: colors.white,
    textAlign: "center",
  },
  disableButtonStyle: {
    backgroundColor: "#A6D8C1",
  },
});
