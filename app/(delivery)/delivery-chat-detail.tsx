import ToraAIChat from '@/component/ToraAIChat';
import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import ChatService from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IMessage } from 'react-native-gifted-chat';

const DeliveryChatDetail = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const patientId = params.customerId as string;
  const patientName = params.customerName as string;
  const patientAvatar = params.customerAvatar as string;

  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeConversation = async () => {
      try {
        if (!user?.uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const convId = await ChatService.getOrCreateConversation(
          patientId,
          patientName,
          patientAvatar,
          user.uid,
          user.firstname || 'Delivery Partner',
          'https://via.placeholder.com/100'
        );

        setConversationId(convId);

        // Listen to messages
        unsubscribe = ChatService.listenToMessages(convId, (msgs) => {
          const giftedMessages: IMessage[] = msgs.map((doc) => ({
            _id: doc.id,
            text: doc.message,
            createdAt: doc.timestamp.toDate(),
            user: {
              _id: doc.senderId,
              name: doc.senderName,
              avatar: doc.senderAvatar || 'https://via.placeholder.com/100',
            },
          })).reverse();

          setMessages(giftedMessages);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error initializing conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat');
        setLoading(false);
      }
    };

    initializeConversation();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, patientId, patientName, patientAvatar]);

  // Mark conversation as read
  useEffect(() => {
    if (conversationId && user?.uid && messages.length > 0) {
      const lastMsg = messages[0];
      if (lastMsg.user._id !== user.uid) {
        ChatService.markConversationAsRead(conversationId);
      }
    }
  }, [messages, conversationId, user?.uid]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!conversationId || !user?.uid) return;
    const msg = newMessages[0];

    try {
      await ChatService.sendMessage(
        conversationId,
        user.uid,
        user.firstname || 'Delivery Partner',
        'https://via.placeholder.com/100',
        msg.text,
        patientId
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [conversationId, user?.uid, patientId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{patientName}</Text>
          <Text style={styles.headerStatus}>Customer</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ToraAIChat
        mode="real"
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.uid || '',
          name: user?.firstname || 'Delivery Partner',
        }}
      />
    </View>
  );
};

export default DeliveryChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
  },
});
