import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormInput from './FormInput';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  type: 'person' | 'ai' | 'lab';
}

interface ChatListComponentProps {
  users: ChatUser[];
  onChatPress: (user: ChatUser) => void;
  title: string;
  showAIOption?: boolean;
  onAIChatPress?: () => void;
  aiTitle?: string;
}

const ChatListComponent: React.FC<ChatListComponentProps> = ({
  users,
  onChatPress,
  title,
  showAIOption = true,
  onAIChatPress,
  aiTitle = 'Chat with Tora AI',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item, index }: { item: ChatUser; index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 50} 
      duration={400}
      useNativeDriver
    >
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => onChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[colors.primary, '#00D68F']}
              style={[styles.avatar, styles.avatarPlaceholder]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          {item.online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text 
              style={[
                styles.lastMessage, 
                item.unread && item.unread > 0 ? styles.unreadMessage : null
              ]} 
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unread && item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread > 99 ? '99+' : item.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
        
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FormInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${title.toLowerCase()}...`}
          containerStyle={styles.searchInputContainer}
        />
      </View>

      {/* AI chat option removed — hidden by default */}

      {/* Section Header moved into FlatList as ListHeaderComponent (for sticky behavior) */}

      {/* Chat List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 16, 80) },
        ]}
        ListHeaderComponent={() => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.white }]}> 
            <Text style={styles.sectionTitle}>{title} ({filteredUsers.length})</Text>
          </View>
        )}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No chats found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : `Start a conversation with a ${title.toLowerCase()}`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ChatListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  searchInputContainer: {
    marginBottom: 0,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
  },
  aiChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.primary + '22',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 8,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIcon: {
    width: 28,
    height: 28,
    tintColor: colors.primary,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F7FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  listContent: {
    paddingBottom: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  listBottomSpacer: {
    height: 120,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    marginHorizontal: 0,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#F0F2F5',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  chatInfo: {
    flex: 1,
    gap: 6,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  chatTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    fontFamily: Fonts.semiBold,
    color: colors.text,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: colors.white,
  },
  chevronContainer: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
