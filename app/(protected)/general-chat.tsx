import ToraAIChat from '@/component/ToraAIChat';
import { colors } from '@/constant/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GeneralChat = () => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ToraAIChat chatContext="general" userName="User" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default GeneralChat;
