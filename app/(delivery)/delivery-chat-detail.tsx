import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import ChatService, { ChatMessage } from '@/services/ChatService';
import NotificationService from '@/services/NotificationService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeliveryChatDetail = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const patientId = params.customerId as string;
  const patientName = params.customerName as string;
  const patientAvatar = params.customerAvatar as string;

  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
          setMessages(msgs);
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat');
        setLoading(false);
      }
    };

    initializeConversation();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, patientId, patientName, patientAvatar]);

  // Mark conversation as read when this screen is focused
  useEffect(() => {
    if (conversationId && user?.uid) {
      ChatService.markConversationAsRead(conversationId);
    }
  }, [conversationId, user?.uid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user?.uid) return;

    try {
      setSending(true);
      const messageText = newMessage.trim();
      setNewMessage('');

      // Send message with recipient ID for unread count tracking
      await ChatService.sendMessage(
        conversationId,
        user.uid,
        user.firstname || 'Delivery Partner',
        'https://via.placeholder.com/100',
        messageText,
        patientId
      );

      // Create notification for patient
      await NotificationService.createNotification(
        patientId,
        'message',
        `New message from ${user.firstname}`,
        messageText,
        { conversationId, deliveryPersonId: user.uid }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwn && styles.messageContainerOwn,
        ]}
      >
        {!isOwn && (
          <View style={styles.messageBubbleLeft}>
            <Text style={styles.messageBubbleText}>{item.message}</Text>
            <Text style={styles.messageTime}>
              {item.timestamp.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        {isOwn && (
          <View style={styles.messageBubbleRight}>
            <Text style={styles.messageBubbleTextRight}>{item.message}</Text>
            <Text style={styles.messageTimeRight}>
              {item.timestamp.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{patientName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          scrollEnabled={true}
        />
      )}

      {/* Input */}
      <SafeAreaView edges={['bottom']} style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.gray}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={sending ? colors.gray : colors.white}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default DeliveryChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 50,
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
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageBubbleLeft: {
    maxWidth: '80%',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderTopLeftRadius: 2,
  },
  messageBubbleRight: {
    maxWidth: '80%',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderTopRightRadius: 2,
  },
  messageBubbleText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  messageBubbleTextRight: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  messageTimeRight: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.black,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
