import ToraAIChat from '@/component/ToraAIChat';
import { colors, sizes } from '@/constant/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NurseChatDetail = () => {
  const params = useLocalSearchParams();
  const { patientName, patientAvatar, useTora } = params;

  const isAI = useTora === 'true';

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <ToraAIChat
        chatContext={isAI ? 'nurse' : 'person'}
        userName="Nurse"
        personName={patientName as string}
        personAvatar={patientAvatar as string}
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
    paddingBottom: 100 ,
    paddingHorizontal:sizes.paddingHorizontal
  },
});
