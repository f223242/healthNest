import { colors, Fonts } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import ChatService, { ChatMessage } from '@/services/ChatService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const NurseChatDetail = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const nurseId = params.nurseId as string;
  const nurseName = params.nurseName as string;
  const nurseImage = params.nurseImage as string;

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
          user.uid,
          user.firstname || 'Patient',
          'https://via.placeholder.com/100', // Or user.profileImage if available
          nurseId,
          nurseName,
          nurseImage
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
  }, [user?.uid, nurseId, nurseName, nurseImage]);

  // Mark conversation as read when messages update (real-time read)
  useEffect(() => {
    if (conversationId && user?.uid && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== user.uid) {
        ChatService.markConversationAsRead(conversationId);
      }
    }
  }, [messages, conversationId, user?.uid]);

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
        user.firstname || 'Patient',
        'https://via.placeholder.com/100',
        messageText,
        nurseId
      );

      // Notification for chat/bell removed as per request.
      // Badge relies on unreadCount in Conversation document which is updated by sendMessage.
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
          <LinearGradient
            colors={[colors.primary, '#00D68F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.messageBubbleRight}
          >
            <Text style={styles.messageBubbleTextRight}>{item.message}</Text>
            <Text style={styles.messageTimeRight}>
              {item.timestamp.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </LinearGradient>
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
          <Text style={styles.headerName}>{nurseName}</Text>
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

export default NurseChatDetail;

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
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  messageContainerOwn: {
    alignItems: 'flex-end',
  },
  messageBubbleLeft: {
    maxWidth: '75%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageBubbleRight: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  messageBubbleText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  messageBubbleTextRight: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.white,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeRight: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});
