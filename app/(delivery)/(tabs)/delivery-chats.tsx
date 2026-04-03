import ChatListComponent from "@/component/ChatListComponent";
import { colors, Fonts } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import ChatService, {
    Conversation,
    LabDeliveryConversation,
} from "@/services/ChatService";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CustomerChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: "person" | "ai";
}

const DeliveryChats = () => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [labConversations, setLabConversations] = useState<
    LabDeliveryConversation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    // Listen to patient conversations
    const unsubscribePatient = ChatService.listenToConversations(
      user.uid,
      (convs) => {
        setConversations(convs);
      },
      true, // isDeliveryPerson parameter
    );

    // Listen to lab conversations
    const unsubscribeLab = ChatService.listenToLabDeliveryConversations(
      user.uid,
      "delivery",
      (labConvs) => {
        setLabConversations(labConvs);
        setLoading(false);
      },
    );

    return () => {
      if (unsubscribePatient) unsubscribePatient();
      if (unsubscribeLab) unsubscribeLab();
    };
  }, [user?.uid]);

  // Calculate total unread count
  useEffect(() => {
    const patientUnread = conversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0,
    );
    const labUnread = labConversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0,
    );
    setTotalUnread(patientUnread + labUnread);
  }, [conversations, labConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const customers: CustomerChat[] = [
    ...conversations.map((conv) => ({
      id: conv.patientId,
      name: conv.patientName,
      avatar: conv.patientAvatar,
      lastMessage: conv.lastMessage || "No messages yet",
      time: conv.lastMessageTime
        ? new Date(conv.lastMessageTime.toDate()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now",
      unread: conv.unreadCount || 0,
      online: true,
      type: "person" as const,
    })),
    ...labConversations.map((conv) => ({
      id: conv.labId,
      name: conv.labName,
      avatar: conv.labAvatar,
      lastMessage: conv.lastMessage || "No messages yet",
      time: conv.lastMessageTime
        ? new Date(conv.lastMessageTime.toDate()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now",
      unread: conv.unreadCount || 0,
      online: true,
      type: "lab" as const,
    })),
  ];

  const handleChatPress = (customer: CustomerChat) => {
    if (customer.type === "lab") {
      // Navigate to lab-delivery chat
      router.push({
        pathname: "/(delivery)/lab-delivery-chat-detail",
        params: {
          labId: customer.id,
          labName: customer.name,
          labAvatar: customer.avatar || "",
        },
      });
    } else {
      // Navigate to patient chat
      router.push({
        pathname: "/(delivery)/delivery-chat-detail",
        params: {
          customerId: customer.id,
          customerName: customer.name,
          customerAvatar: customer.avatar || "",
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Header with unread badge */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      <ScrollView
        scrollEnabled={conversations.length > 0}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.listCard}>
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                Messages from patients will appear here
              </Text>
            </View>
          ) : (
            <ChatListComponent
              users={customers}
              onChatPress={handleChatPress}
              title="Customers"
              showAIOption={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.black,
  },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.white,
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
