import ChatListComponent from '@/component/ChatListComponent';
import { colors } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import NurseChatService, { NurseConversation } from '@/services/NurseChatService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<NurseChat[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to patient's nurse conversations
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = NurseChatService.listenToPatientConversations(
      user.uid,
      (convs: NurseConversation[]) => {
        const formattedConvs: NurseChat[] = convs.map((conv) => ({
          id: conv.id,
          name: conv.nurseName,
          avatar: conv.nurseAvatar || 'https://i.pravatar.cc/150?img=1',
          lastMessage: conv.lastMessage || 'Start a conversation',
          time: conv.lastMessageTime ? formatTime(conv.lastMessageTime.toDate()) : '',
          unread: conv.patientUnreadCount || 0,
          online: false,
          type: 'person' as const,
        }));
        setConversations(formattedConvs);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff === 1) {
      return 'Yesterday';
    } else if (dayDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatPress = (nurse: NurseChat) => {
    router.push({
      pathname: '/(protected)/nurse-chat-detail',
      params: {
        nurseId: nurse.id.split('_')[1] || nurse.id, // Extract nurse ID from conversation ID
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

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ChatListComponent
        users={conversations}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
