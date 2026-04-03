import ToraAIChat from "@/component/ToraAIChat";
import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import ChatService from "@/services/ChatService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";

const LabDeliveryChatDetail = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const labId = params.labId as string;
  const labName = params.labName as string;
  const labAvatar = params.labAvatar as string;

  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeConversation = async () => {
      try {
        if (!user?.uid) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const convId = await ChatService.getOrCreateLabDeliveryConversation(
          labId,
          labName,
          labAvatar,
          user.uid,
          user.firstname || "Delivery Boy",
          user.additionalInfo?.profileImage ||
            "https://via.placeholder.com/100",
        );
        setConversationId(convId);

        // Listen to messages
        unsubscribe = ChatService.listenToLabDeliveryMessages(
          convId,
          (msgs) => {
            const formattedMessages: IMessage[] = msgs
              .map((msg) => ({
                _id: msg.id,
                text: msg.message,
                createdAt: msg.timestamp.toDate(),
                user: {
                  _id: msg.senderId,
                  name: msg.senderName,
                  avatar: msg.senderAvatar,
                },
              }))
              .reverse(); // GiftedChat expects newest first
            setMessages(formattedMessages);
          },
        );

        setLoading(false);
      } catch (err) {
        console.error("Error initializing conversation:", err);
        setError("Failed to load chat");
        setLoading(false);
      }
    };

    initializeConversation();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, labId, labName, labAvatar]);

  // Send message
  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      try {
        if (!conversationId || !user) return;

        const message = messages[0];
        await ChatService.sendLabDeliveryMessage(
          conversationId,
          user.uid,
          user.firstname || "Delivery Boy",
          user.additionalInfo?.profileImage ||
            "https://via.placeholder.com/100",
          message.text,
        );
      } catch (err) {
        console.error("Error sending message:", err);
      }
    },
    [conversationId, user],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{labName}</Text>
          <Text style={styles.headerSubtitle}>Lab Technician</Text>
        </View>
      </View>

      {/* Chat */}
      <ToraAIChat
        mode="real"
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.uid || "",
          name: user?.firstname || "Delivery Boy",
          avatar:
            user?.additionalInfo?.profileImage ||
            "https://via.placeholder.com/100",
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
    fontFamily: Fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 0 : 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.white,
    opacity: 0.8,
  },
});

export default LabDeliveryChatDetail;
