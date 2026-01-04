import ToraAIChat from '@/component/ToraAIChat';
import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import NurseChatService from '@/services/NurseChatService';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const NurseChatDetail = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const nurseId = params.nurseId as string;
  const nurseName = params.nurseName as string;
  const nurseAvatar = (params.nurseAvatar as string) || '';
  const useTora = params.useTora === 'true';

  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation (skip for Tora AI)
  useEffect(() => {
    if (useTora) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeConversation = async () => {
      try {
        if (!user?.uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Get profile image from additionalInfo
        const userProfileImage = (user.additionalInfo as any)?.profileImage || '';

        const convId = await NurseChatService.getOrCreateConversation(
          user.uid,
          user.firstname || 'Patient',
          userProfileImage,
          nurseId,
          nurseName,
          nurseAvatar
        );

        setConversationId(convId);

        // Listen to messages
        unsubscribe = NurseChatService.listenToMessages(convId, (msgs) => {
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
  }, [user?.uid, nurseId, nurseName, nurseAvatar, useTora]);

  // Mark conversation as read
  useEffect(() => {
    if (conversationId && user?.uid && messages.length > 0) {
      const lastMsg = messages[0];
      if (lastMsg.user._id !== user.uid) {
        NurseChatService.markConversationAsRead(conversationId, 'patient');
      }
    }
  }, [messages, conversationId, user?.uid]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!conversationId || !user?.uid) return;
    const msg = newMessages[0];
    const userProfileImage = (user.additionalInfo as any)?.profileImage || '';

    try {
      await NurseChatService.sendMessage(
        conversationId,
        user.uid,
        user.firstname || 'Patient',
        userProfileImage,
        msg.text,
        nurseId
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [conversationId, user?.uid, nurseId, user?.firstname, user?.additionalInfo]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // For Tora AI chat
  if (useTora) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Tora AI</Text>
            <Text style={styles.headerStatus}>Health Assistant</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        <ToraAIChat
          mode="ai"
          user={{
            _id: user?.uid || '',
            name: user?.firstname || 'Patient',
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{nurseName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
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
          name: user?.firstname || 'Patient',
        }}
      />
    </SafeAreaView>
  );
};

export default NurseChatDetail;

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
