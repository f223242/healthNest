import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { Animated, StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  children?: React.ReactNode;
  animatedStyle?: any;
};

const FormCard = ({
  title,
  subtitle,
  style,
  titleStyle,
  subtitleStyle,
  children,
  animatedStyle,
}: Props) => {
  return (
    <Animated.View style={[styles.card as any, style as any, animatedStyle]}>
      {title ? <Animated.Text style={[styles.title as any, titleStyle as any]}>{title}</Animated.Text> : null}
      {subtitle ? <Animated.Text style={[styles.subtitle as any, subtitleStyle as any]}>{subtitle}</Animated.Text> : null}
      <Animated.View style={styles.content as any}>{children}</Animated.View>
    </Animated.View>
  );
};

export default FormCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: colors.black,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginBottom: 12,
  },
  content: {
    marginTop: 6,
  },
});
