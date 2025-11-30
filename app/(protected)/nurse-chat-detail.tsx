import ToraAIChat from '@/component/ToraAIChat';
import { colors } from '@/constant/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NurseChatDetail = () => {
  const params = useLocalSearchParams();
  const { nurseName, nurseAvatar, useTora } = params;

  const isAI = useTora === 'true';

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ToraAIChat
        chatContext={isAI ? 'nurse' : 'person'}
        userName="User"
        personName={nurseName as string}
        personAvatar={nurseAvatar as string}
        isAI={isAI}
      />
    </SafeAreaView>
  );
};

export default NurseChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
