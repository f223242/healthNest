import ChatListComponent from '@/component/ChatListComponent';
import { colors, Fonts, sizes } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import NurseChatService, { NurseConversation } from '@/services/NurseChatService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PatientChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: 'person' | 'ai';
  patientId?: string;
  conversationId?: string;
}

const NurseChats = () => {
  const { user } = useAuthContext();
  const [patients, setPatients] = React.useState<PatientChat[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = NurseChatService.listenToNurseConversations(
      user.uid,
      (conversations: NurseConversation[]) => {
        const chatList: PatientChat[] = conversations.map(conv => ({
          id: conv.id,
          name: conv.patientName,
          avatar: conv.patientAvatar || 'https://i.pravatar.cc/150?img=3',
          lastMessage: conv.lastMessage || 'Start a conversation',
          time: conv.lastMessageTime ? formatTime(conv.lastMessageTime.toDate()) : '',
          unread: conv.nurseUnreadCount || 0,
          online: false,
          type: 'person' as const,
          patientId: conv.patientId,
          conversationId: conv.id,
        }));
        setPatients(chatList);
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

  const handleChatPress = (patient: PatientChat) => {
    router.push({
      pathname: '/(nurse)/nurse-chat-detail',
      params: {
        conversationId: patient.conversationId || patient.id,
        patientId: patient.patientId || '',
        patientName: patient.name,
        patientAvatar: patient.avatar || '',
      },
    });
  };

  // Count unread messages
  const totalUnread = patients.reduce((sum, p) => sum + (p.unread || 0), 0);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00B976', '#00D68F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Patient Chats</Text>
            <Text style={styles.headerSubtitle}>
              {patients.length} active • {totalUnread > 0 ? `${totalUnread} unread` : 'No unread messages'}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={24} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
        <View style={styles.listCard}>
          <ChatListComponent
            users={patients}
            onChatPress={handleChatPress}
            title="Patients"
            showAIOption={false} // Removed Tora option if user wants pure dynamic, or keep it? User said "static chat remove kru".
          // If I remove AI option, pass showAIOption={false}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default NurseChats;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: sizes.paddingHorizontal,
    zIndex: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
});

