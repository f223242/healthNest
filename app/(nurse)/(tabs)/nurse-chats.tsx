import ChatListComponent from '@/component/ChatListComponent';
import { colors, Fonts, sizes } from '@/constant/theme';
import { useAuthContext } from '@/hooks/useFirebaseAuth';
import ChatService from '@/services/ChatService';
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
}

const NurseChats = () => {
  const { user } = useAuthContext();
  const [patients, setPatients] = React.useState<PatientChat[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = ChatService.listenToConversations(
      user.uid,
      (conversations) => {
        const chatList: PatientChat[] = conversations.map(conv => ({
          id: conv.id,
          name: conv.patientName,
          avatar: conv.patientAvatar,
          lastMessage: conv.lastMessage,
          time: conv.lastMessageTime ? conv.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unread: (conv.lastMessageSenderId !== user.uid) ? conv.unreadCount : 0,
          online: false, // We don't have real-time online status yet
          type: 'person',
          patientId: conv.patientId // Store patientId for navigation
        }));
        setPatients(chatList);
        setLoading(false);
      },
      true // isNurse/Delivery (provider side)
    );

    return () => unsubscribe();
  }, [user]);

  const handleChatPress = (patient: PatientChat) => {
    // If patient has 'patientId' property (from our mapping), use it. Fallback to id if not.
    // In our mapping above, we adding patientId. But interface needs update or we cast.
    // Actually, conv.id is conversationId. patient.patientId is the User ID.
    // nurse-chat-detail expects: nurseId (if User view) or...
    // Wait, who is viewing? Nurse.
    // Nurse views "Nurse Chat Detail"?
    // If Nurse views it, params should be: `patientId`, `patientName`.
    // Let's check `nurse-chat-detail.tsx` again. 
    // It uses `params.nurseId`. It assumes User is viewing Nurse.
    // If Nurse is viewing, logic differs?
    // User (Patient) -> View Nurse -> params: nurseId.
    // Nurse -> View Patient -> params: ???

    // I need a generic ChatDetail or update `nurse-chat-detail` to handle both modes?
    // Or `nurse-chats.tsx` should point to a different file?
    // `app/(nurse)/nurse-chat-detail.tsx` (Step 507) exists.
    // I updated `(protected)/nurse-chat-detail.tsx` (User Side).
    // I DID NOT update `(nurse)/nurse-chat-detail.tsx`!
    // Step 507 showed `(nurse)/nurse-chat-detail.tsx`.

    // I need to update `(nurse)/nurse-chat-detail.tsx` to handle Nurse -> Patient chat.
    // Params: `conversationId`? or `patientId`.
    // I'll assume `patientId` logic.

    router.push({
      pathname: '/(nurse)/nurse-chat-detail',
      params: {
        conversationId: patient.id, // Pass conversation ID directly if possible, or patientId
        patientId: (patient as any).patientId,
        patientName: patient.name,
        patientAvatar: patient.avatar || '',
        // The chat detail needs to know who we are chatting WITH.
      },
    });
  };

  const handleAIChatPress = () => {
    // Tora AI logic...
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

