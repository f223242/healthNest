import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Step {
  text: string;
}

interface InstructionStepsProps {
  steps: Step[];
  containerStyle?: ViewStyle;
}

const InstructionSteps: React.FC<InstructionStepsProps> = ({
  steps,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {steps.map((step, index) => (
        <View
          key={index}
          style={[
            styles.instructionItem,
            index === steps.length - 1 && { marginBottom: 0 },
          ]}
        >
          <View style={styles.numberCircle}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
    </View>
  );
};

export default InstructionSteps;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  stepText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
});
