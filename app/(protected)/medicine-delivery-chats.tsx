import ChatListComponent from '@/component/ChatListComponent';
import { colors } from '@/constant/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DeliveryPersonChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: 'person' | 'ai';
}

const MedicineDeliveryChats = () => {
  // Sample delivery person data
  const deliveryPersons: DeliveryPersonChat[] = [
    {
      id: '1',
      name: 'Ahmed Ali',
      avatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'On my way with your order',
      time: '3:15 PM',
      unread: 1,
      online: true,
      type: 'person',
    },
    {
      id: '2',
      name: 'Hassan Khan',
      avatar: 'https://i.pravatar.cc/150?img=14',
      lastMessage: 'Delivered successfully',
      time: '2:45 PM',
      online: true,
      type: 'person',
    },
    {
      id: '3',
      name: 'Bilal Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=52',
      lastMessage: 'Arriving in 10 minutes',
      time: '12:30 PM',
      online: false,
      type: 'person',
    },
    {
      id: '4',
      name: 'Usman Malik',
      avatar: 'https://i.pravatar.cc/150?img=59',
      lastMessage: 'Order picked up from pharmacy',
      time: 'Yesterday',
      unread: 2,
      online: false,
      type: 'person',
    },
    {
      id: '5',
      name: 'Kamran Shah',
      avatar: 'https://i.pravatar.cc/150?img=68',
      lastMessage: 'Thank you for your order',
      time: 'Yesterday',
      online: false,
      type: 'person',
    },
  ];

  const handleChatPress = (person: DeliveryPersonChat) => {
    router.push({
      pathname: '/(protected)/delivery-chat-detail',
      params: {
        personId: person.id,
        personName: person.name,
        personAvatar: person.avatar || '',
        useTora: 'false',
      },
    });
  };

  const handleAIChatPress = () => {
    router.push({
      pathname: '/(protected)/delivery-chat-detail',
      params: {
        personId: 'tora',
        personName: 'Tora AI',
        useTora: 'true',
      },
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ChatListComponent
        users={deliveryPersons}
        onChatPress={handleChatPress}
        title="Delivery Partners"
        showAIOption={true}
        onAIChatPress={handleAIChatPress}
        aiTitle="Chat with Tora AI for Delivery Support"
      />
    </SafeAreaView>
  );
};

export default MedicineDeliveryChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
