import { SearchIcon } from "@/assets/svg";
import FormInput from "@/component/FormInput";
import { appStyles, colors, sizes } from "@/constant/theme";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <FormInput LeftIcon={SearchIcon} placeholder="Search  for services" />
        <Text style={{ ...appStyles.h3, marginTop: 20 }}>Associated Labs</Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.paddingHorizontal,
    backgroundColor: colors.white,
    // paddingTop: 40,
  },
});
