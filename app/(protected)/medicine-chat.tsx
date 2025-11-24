import ToraAIChat from "@/component/ToraAIChat";
import { colors } from "@/constant/theme";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MedicineChat = () => {
  const params = useLocalSearchParams();
  const { personName, personAvatar, useTora } = params;

  const isAI = useTora === 'true';

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ToraAIChat 
        chatContext={isAI ? "medicine-delivery" : "person"}
        userName="User"
        personName={personName as string}
        personAvatar={personAvatar as string}
        isAI={isAI}
      />
    </SafeAreaView>
  );
};

export default MedicineChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
