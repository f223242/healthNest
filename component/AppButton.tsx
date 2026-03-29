import { colors } from "@/constant/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
type Props = {
  title?: string | React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  loading?: boolean;
};

const AppButton = ({
  title,
  containerStyle,
  textStyle,
  onPress,
  disabled,
  style,
  children,
  gradientColors,
  gradientStart,
  gradientEnd,
  loading,
}: Props) => {
  const useGradient = !!gradientColors && !disabled;
  const effectiveGradient = gradientColors ?? [colors.primary, "#00D68F"];
  // Ensure tuple-like typing for LinearGradient: at least two colors
  const gradientTuple = (effectiveGradient && effectiveGradient.length >= 2
    ? effectiveGradient
    : [colors.primary, "#00D68F"]) as unknown as readonly string[];

  return (
    <TouchableOpacity
      style={[styles.buttonStyle, containerStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {useGradient ? (
        <LinearGradient
          colors={gradientTuple as any}
          start={gradientStart || { x: 0, y: 0 }}
          end={gradientEnd || { x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : disabled ? (
        <View style={[StyleSheet.absoluteFill, styles.disabledOverlay]} />
      ) : null}

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            {children}
            {title ? (
              typeof title === "string" ? (
                <Text
                  style={[styles.buttonTextStyle, styles.buttonText, textStyle]}
                >
                  {title}
                </Text>
              ) : (
                title
              )
            ) : null}
          </>
        )}
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
  disabledOverlay: {
    backgroundColor: "#A6D8C1",
    opacity: 0.95,
  },
});
