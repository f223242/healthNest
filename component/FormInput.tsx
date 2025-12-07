import { appStyles, colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SvgProps } from "react-native-svg";

interface FormInputProps extends TextInputProps {
  value?: string;
  label?: string;
  error?: string;
  LeftIcon?: React.FC<SvgProps>;
  RightIcon?: React.FC<SvgProps>;
  isPassword?: boolean;
  isDropdown?: boolean;
  data?: Array<{ label: string; value: string }>;
  onDropdownChange?: (item: { label: string; value: string }) => void;
  labelField?: string;
  valueField?: string;
  containerStyle?: ViewStyle;
  textStyle?: ViewStyle;
}

const FormInput: React.FC<FormInputProps> = ({
  value,
  label,
  error,
  LeftIcon,
  RightIcon,
  containerStyle,
  textStyle,
  isPassword,
  multiline,
  isDropdown,
  data,
  onDropdownChange,
  labelField = "label",
  valueField = "value",
  ...rest
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade in animation
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);
  
  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.labelText}>{label}</Text>
      )}
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          {
            borderColor: error ? colors.danger : (value ? colors.primary : colors.white),
            borderWidth: 1,
            transform: [{ translateX: shakeAnimation }],
          },
          multiline && styles.multilineContainer,
          textStyle,
        ]}
      >
        <View style={[styles.inputStyle, multiline && styles.multilineInputStyle]}>
          {LeftIcon && <LeftIcon />}
          {isDropdown ? (
            <Dropdown
              data={data || []}
              labelField={labelField}
              valueField={valueField}
              placeholder={rest.placeholder}
              value={value}
              onChange={onDropdownChange || (() => {})}
              style={{ 
                flex: 1,
                marginLeft: LeftIcon ? 8 : 0,
              }}
              placeholderStyle={{
                fontFamily: Fonts.regular,
                fontSize: 16,
                color: "#9CA3AF",
              }}
              selectedTextStyle={{
                fontFamily: Fonts.regular,
                fontSize: 16,
                color: colors.primary,
              }}
              itemTextStyle={{
                fontFamily: Fonts.regular,
                fontSize: 16,
                color: colors.black,
              }}
              activeColor={colors.lightGreen}
              renderRightIcon={() => RightIcon ? <RightIcon width={20} height={20} /> : null}
            />
          ) : (
            <TextInput
              style={{
                flex: 1,
                marginLeft: LeftIcon ? 8 : 0,
                color: colors.primary,
                fontFamily: Fonts.regular,
                textAlignVertical: multiline ? "top" : "center",
                paddingTop: multiline ? 8 : 0,
                paddingBottom: multiline ? 8 : 0,
              }}
              secureTextEntry={isPassword && !showPassword}
              value={value}
              multiline={multiline}
              {...rest}
            />
          )}
          {!isDropdown && (
            isPassword ? (
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            ) : (
              RightIcon && <RightIcon />
            )
          )}
        </View>
      </Animated.View>
      {error && (
        <Animated.View style={{ opacity: fadeAnimation }}>
          <Text style={[appStyles.errorStyle, styles.errorText]}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 15,
  },
  labelText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: colors.primary,
    marginBottom: 8,
  },
  container: {
    borderRadius: 12,
    backgroundColor: "#E5F5F0",
    height: 56,
    justifyContent: "center",
  },
  multilineContainer: {
    height: "auto",
    minHeight: 56,
    justifyContent: "flex-start",
    paddingVertical: 8,
  },
  inputStyle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  multilineInputStyle: {
    alignItems: "flex-start",
    paddingVertical: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
  },
  // error: {
  //   color: "red",
  //   marginTop: 4,
  // },
});
