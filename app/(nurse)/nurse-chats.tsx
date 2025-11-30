import ChatListComponent from '@/component/ChatListComponent';
import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
}

const NurseChats = () => {
  // Sample patient data for nurse
  const patients: PatientChat[] = [
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/150?img=11',
      lastMessage: 'When will you arrive?',
      time: '2:30 PM',
      unread: 2,
      online: true,
      type: 'person',
    },
    {
      id: '2',
      name: 'Emma Watson',
      avatar: 'https://i.pravatar.cc/150?img=45',
      lastMessage: 'Thank you for your help',
      time: '1:15 PM',
      online: true,
      type: 'person',
    },
    {
      id: '3',
      name: 'Robert Johnson',
      avatar: 'https://i.pravatar.cc/150?img=33',
      lastMessage: 'Can you check my blood pressure?',
      time: '11:45 AM',
      online: false,
      type: 'person',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      avatar: 'https://i.pravatar.cc/150?img=23',
      lastMessage: 'I need help with medication',
      time: 'Yesterday',
      unread: 1,
      online: false,
      type: 'person',
    },
    {
      id: '5',
      name: 'Michael Brown',
      avatar: 'https://i.pravatar.cc/150?img=52',
      lastMessage: 'See you tomorrow',
      time: 'Yesterday',
      online: false,
      type: 'person',
    },
  ];

  const handleChatPress = (patient: PatientChat) => {
    router.push({
      pathname: '/(nurse)/nurse-chat-detail',
      params: {
        patientId: patient.id,
        patientName: patient.name,
        patientAvatar: patient.avatar || '',
        useTora: 'false',
      },
    });
  };

  const handleAIChatPress = () => {
    router.push({
      pathname: '/(nurse)/nurse-chat-detail',
      params: {
        patientId: 'tora',
        patientName: 'Tora AI',
        useTora: 'true',
      },
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#00B976', '#00D68F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Ionicons name="chatbubbles" size={32} color={colors.white} style={styles.headerIcon} />
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Patient Chats</Text>
            <Text style={styles.headerSubtitle}>Connect with your patients instantly</Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.listCard}>
        <ChatListComponent
          users={patients}
          onChatPress={handleChatPress}
          title="Patients"
          showAIOption={true}
          onAIChatPress={handleAIChatPress}
          aiTitle="Chat with Tora AI Assistant"
        />
      </View>
    </SafeAreaView>
  );
};

export default NurseChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 60,
  },
  headerIcon: {
    marginRight: 16,
    alignSelf: 'center',
  },
  headerTextBlock: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white + 'CC',
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
