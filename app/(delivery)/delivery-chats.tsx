import ChatListComponent from '@/component/ChatListComponent';
import { colors } from '@/constant/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomerChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: 'person' | 'ai';
}

const DeliveryChats = () => {
  // Sample customer data for delivery person
  const customers: CustomerChat[] = [
    {
      id: '1',
      name: 'Ali Hassan',
      avatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'Where is my order?',
      time: '3:15 PM',
      unread: 1,
      online: true,
      type: 'person',
    },
    {
      id: '2',
      name: 'Fatima Khan',
      avatar: 'https://i.pravatar.cc/150?img=45',
      lastMessage: 'Thank you for delivery',
      time: '2:45 PM',
      online: true,
      type: 'person',
    },
    {
      id: '3',
      name: 'Imran Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=52',
      lastMessage: 'Please call when you arrive',
      time: '12:30 PM',
      online: false,
      type: 'person',
    },
    {
      id: '4',
      name: 'Sara Malik',
      avatar: 'https://i.pravatar.cc/150?img=23',
      lastMessage: 'Can you deliver today?',
      time: 'Yesterday',
      unread: 2,
      online: false,
      type: 'person',
    },
    {
      id: '5',
      name: 'Hamza Shah',
      avatar: 'https://i.pravatar.cc/150?img=68',
      lastMessage: 'Order received, thanks!',
      time: 'Yesterday',
      online: false,
      type: 'person',
    },
  ];

  const handleChatPress = (customer: CustomerChat) => {
    router.push({
      pathname: '/(delivery)/delivery-chat-detail',
      params: {
        customerId: customer.id,
        customerName: customer.name,
        customerAvatar: customer.avatar || '',
        useTora: 'false',
      },
    });
  };

  const handleAIChatPress = () => {
    router.push({
      pathname: '/(delivery)/delivery-chat-detail',
      params: {
        customerId: 'tora',
        customerName: 'Tora AI',
        useTora: 'true',
      },
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ChatListComponent
        users={customers}
        onChatPress={handleChatPress}
        title="Customers"
        showAIOption={true}
        onAIChatPress={handleAIChatPress}
        aiTitle="Chat with Tora AI for Support"
      />
    </SafeAreaView>
  );
};

export default DeliveryChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
