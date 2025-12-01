import ToraAIChat from '@/component/ToraAIChat';
import { colors } from '@/constant/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeliveryChatDetail = () => {
  const params = useLocalSearchParams();
  const { customerName, customerAvatar, useTora } = params;

  const isAI = useTora === 'true';

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
    paddingBottom: 100,
  },
});
