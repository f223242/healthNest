import ChatListComponent from '@/component/ChatListComponent';
import { colors } from '@/constant/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NurseChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: 'person' | 'ai';
}

const NurseChats = () => {
  // Sample nurse data
  const nurses: NurseChat[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'I can visit tomorrow at 10 AM',
      time: '2:30 PM',
      unread: 2,
      online: true,
      type: 'person',
    },
    {
      id: '2',
      name: 'Emily Davis',
      avatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'Your vitals look good',
      time: '1:15 PM',
      online: true,
      type: 'person',
    },
    {
      id: '3',
      name: 'Michael Brown',
      avatar: 'https://i.pravatar.cc/150?img=12',
      lastMessage: 'Please take the medication on time',
      time: '11:45 AM',
      online: false,
      type: 'person',
    },
    {
      id: '4',
      name: 'Jessica Wilson',
      avatar: 'https://i.pravatar.cc/150?img=9',
      lastMessage: 'I will bring the equipment',
      time: 'Yesterday',
      unread: 1,
      online: false,
      type: 'person',
    },
    {
      id: '5',
      name: 'David Martinez',
      avatar: 'https://i.pravatar.cc/150?img=13',
      lastMessage: 'See you next week',
      time: 'Yesterday',
      online: false,
      type: 'person',
    },
  ];

  const handleChatPress = (nurse: NurseChat) => {
    router.push({
      pathname: '/(protected)/nurse-chat-detail',
      params: {
        nurseId: nurse.id,
        nurseName: nurse.name,
        nurseAvatar: nurse.avatar || '',
        useTora: 'false',
      },
    });
  };

  const handleAIChatPress = () => {
    router.push({
      pathname: '/(protected)/nurse-chat-detail',
      params: {
        nurseId: 'tora',
        nurseName: 'Tora AI',
        useTora: 'true',
      },
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ChatListComponent
        users={nurses}
        onChatPress={handleChatPress}
        title="Nurses"
        showAIOption={true}
        onAIChatPress={handleAIChatPress}
        aiTitle="Chat with Tora AI for Health Advice"
      />
    </SafeAreaView>
  );
};

export default NurseChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
