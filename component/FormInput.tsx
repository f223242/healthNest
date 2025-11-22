import { appStyles, colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";
interface FormInputProps extends TextInputProps {
  value?: string;
  label?: string;
  error?: string;
  LeftIcon?: React.FC<SvgProps>;
  RightIcon?: React.FC<SvgProps>;
  isPassword?: boolean;
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
  ...rest
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <>
      <View
        style={[
          styles.container,
          containerStyle,
          {
            borderColor: value ? colors.primary : colors.white,
            borderWidth: 1,
          },
          multiline && styles.multilineContainer,
          textStyle,
        ]}
      >
        <View style={[styles.inputStyle, multiline && styles.multilineInputStyle]}>
          {LeftIcon && <LeftIcon />}
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
          {isPassword ? (
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          ) : (
            RightIcon && <RightIcon />
          )}
        </View>
      </View>
      {error && <Text style={appStyles.errorStyle}>{error}</Text>}
    </>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: "#E5F5F0",
    height: 56,
    justifyContent: "center",
    // backgroundColor: "blue",
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
  // error: {
  //   color: "red",
  //   marginTop: 4,
  // },
});
