import { colors, Fonts, sizes } from "@/constant/theme";
import { useAuthContext } from "@/hooks/useFirebaseAuth";
import ChatService, { Conversation } from "@/services/ChatService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LabChatsScreen = () => {
  const router = useRouter();
  const { user, getAllUsers } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableBoys, setAvailableBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoys = async () => {
      try {
        const boys = await getAllUsers("Lab Delivery");
        setAvailableBoys(boys);
      } catch (e) {
        console.error("Error fetching delivery boys", e);
      }
    };
    fetchBoys();
  }, []);

  useEffect(() => {
    if (!user) return;

    // For lab technician, we listen as "patient" (participant 1) 
    // since they are the ones managing the delivery boy
    const unsubscribe = ChatService.listenToConversations(user.uid, (data) => {
      setConversations(data);
      setLoading(false);
    }, false); // isDeliveryPerson = false (treating lab tech as initiator)

    return () => unsubscribe();
  }, [user]);

  const formatChatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isMe = item.lastMessageSenderId === user?.uid;
    // Since lab tech is 'patientId' in our current hack, the other is 'deliveryPersonId'
    const otherParticipantName = item.deliveryPersonName || "Delivery Partner";
    const otherParticipantAvatar = item.deliveryPersonAvatar || "https://via.placeholder.com/100";

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          router.push({
            pathname: "/(lab)/lab-delivery-chat-detail",
            params: {
              deliveryId: item.deliveryPersonId,
              deliveryName: item.deliveryPersonName,
              deliveryAvatar: item.deliveryPersonAvatar,
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: otherParticipantAvatar }} style={styles.avatar} />
          {item.unreadCount > 0 && !isMe && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {otherParticipantName}
            </Text>
            <Text style={styles.time}>
              {formatChatTime(item.lastMessageTime)}
            </Text>
          </View>

          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && !isMe && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {isMe ? "You: " : ""}
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Coordination</Text>
        <Text style={styles.headerSubtitle}>Manage your sampling logistics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {availableBoys.length > 0 && (
          <View style={styles.availableSection}>
            <Text style={styles.sectionTitle}>Available Delivery Partners</Text>
            <FlatList
              data={availableBoys}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.availablePartnerCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(lab)/lab-delivery-chat-detail",
                      params: {
                        deliveryId: item.uid,
                        deliveryName: `${item.firstname || ""} ${item.lastname || ""}`.trim() || "Delivery Partner",
                        deliveryAvatar: item.additionalInfo?.profileImage || item.profileImage || "https://via.placeholder.com/100",
                      },
                    })
                  }
                >
                  <View>
                    <Image
                      source={{ uri: item.additionalInfo?.profileImage || item.profileImage || "https://via.placeholder.com/100" }}
                      style={styles.partnerAvatar}
                    />
                    <View style={styles.onlineIndicator} />
                  </View>
                  <Text style={styles.partnerName} numberOfLines={1}>
                    {item.firstname || "Partner"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.chatsSection}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Active Chats</Text>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={colors.gray} />
              </View>
              <Text style={styles.emptyTitle}>No active chats</Text>
              <Text style={styles.emptySubtitle}>
                Select an available delivery partner above to start coordinating.
              </Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {conversations.map((item) => (
                <View key={item.id}>{renderConversationItem({ item })}</View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabChatsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  listContent: {
    paddingVertical: 10,
  },
  conversationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  unreadText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
  lastMessageUnread: {
    fontFamily: Fonts.bold,
    color: colors.text,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  availableSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  chatsSection: {
    paddingTop: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.text,
    marginLeft: 20,
    marginBottom: 15,
  },
  availablePartnerCard: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  partnerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: colors.white,
  },
  partnerName: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.text,
    textAlign: "center",
  },
});
