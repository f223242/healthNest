import ToraAIChat from '@/component/ToraAIChat';
import { colors } from '@/constant/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeliveryChatDetail = () => {
  const params = useLocalSearchParams();
  const { customerName, customerAvatar, useTora } = params;

  // Ensure AI is disabled for Delivery Module as per user request
  const isAI = false;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ToraAIChat
        chatContext={isAI ? 'medicine-delivery' : 'person'}
        userName="Delivery Partner"
        personName={customerName as string}
        personAvatar={customerAvatar as string}
        isAI={isAI}
      />
    </SafeAreaView>
  );
};

export default DeliveryChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,

  },
});
