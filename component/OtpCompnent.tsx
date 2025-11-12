import React from "react";
import { StyleSheet, Text, View } from "react-native";
interface OtpCompnentProps {
  text: string;
}

const OtpCompnent = ({ text }: OtpCompnentProps) => {
  return (
    <View style={styles.cardStyle}>
      <Text>{text}</Text>
    </View>
  );
};

export default OtpCompnent;

const styles = StyleSheet.create({
  container: {},
  cardStyle: {
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E5F5F0",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
