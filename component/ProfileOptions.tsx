import { colors, Fonts } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
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
  description?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  showBorder?: boolean;
}

const ProfileOptions: React.FC<ProfileOptionsProps> = ({
  leftIcon,
  title,
  description,
  onPress,
  containerStyle,
  showBorder = true,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.profileOptionsStles,
        !showBorder && styles.noBorder,
        containerStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.iconContainer}>
        {leftIcon}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </TouchableOpacity>
  );
};

export default ProfileOptions;

const styles = StyleSheet.create({
  profileOptionsStles: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: colors.white,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 18,
  },
});
