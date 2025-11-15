import { GoArrowIcon } from "@/assets/svg";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ProfileOptionsProps {
  leftIcon?: React.ReactNode;
  title?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

const ProfileOptions: React.FC<ProfileOptionsProps> = ({
  leftIcon,
  title,
  onPress,
  containerStyle,
}) => {
  return (
    <View style={[styles.profileOptionsStles, containerStyle]}>
      <TouchableOpacity
        style={{
          gap: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={onPress}
      >
        {leftIcon}
        <Text style={{ flex: 1 }}>{title}</Text>
        <GoArrowIcon />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileOptions;

const styles = StyleSheet.create({
  profileOptionsStles: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 12,
    borderRadius: 8,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
