import { colors } from "@/constant/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
type Props = {
  title?: string | React.ReactNode;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
};

const AppButton = ({
  title,
  containerStyle,
  textStyle,
  onPress,
  disabled,
  style,
  children,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.buttonStyle, disabled && styles.disableButtonStyle, containerStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {children}
        {title ? (
          typeof title === 'string' ? (
            <Text style={[styles.buttonTextStyle, styles.buttonText, textStyle]}>{title}</Text>
          ) : (
            title
          )
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default AppButton;
const styles = StyleSheet.create({
  buttonStyle: {
    paddingVertical: 12,
    borderRadius:12,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 24,
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
