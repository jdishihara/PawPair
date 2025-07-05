import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getUserConversations, ConversationWithProfile, getTotalUnreadCount, getBotMessages } from '../utils/messageStorage';
import { getCurrentUser, getUserByEmail } from '../utils/userStorage';
import ChatScreen from './ChatScreen';
import ChatBotScreen from './ChatBotScreen';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfile | null>(null);
  const [selectedChatBot, setSelectedChatBot] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [botMessageCount, setBotMessageCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(false); // Don't show loading indicator for background refresh
      loadUnreadCount();
      loadBotMessageCount();
    }, 30000); // Refresh every 30 seconds instead of 5

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await loadCurrentUser();
    await loadConversations();
    await loadUnreadCount();
    await loadBotMessageCount();
  };

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadConversations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const userConversations = await getUserConversations();
      
      // Enhance conversations with user profile data
      const enhancedConversations = await Promise.all(
        userConversations.map(async (conv) => {
          const otherUserProfile = await getUserByEmail(conv.otherUserEmail);
          return {
            ...conv,
            otherUserName: otherUserProfile 
              ? `${otherUserProfile.firstName} ${otherUserProfile.lastName}`
              : conv.otherUserEmail.split('@')[0]
          };
        })
      );
      
      setConversations(enhancedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getTotalUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadBotMessageCount = async () => {
    try {
      const botMessages = await getBotMessages();
      setBotMessageCount(botMessages.length);
    } catch (error) {
      console.error('Error loading bot message count:', error);
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationWithProfile }) => {
    const lastMessage = item.conversation.lastMessage;
    const isUnread = item.conversation.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isUnread && styles.unreadItem]}
        onPress={() => setSelectedConversation(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, isUnread && styles.unreadText]}>
              {item.otherUserName}
            </Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {formatLastMessageTime(lastMessage.timestamp)}
              </Text>
            )}
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[styles.lastMessage, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {lastMessage ? lastMessage.content : 'Start a conversation...'}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPawBotItem = () => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => setSelectedChatBot(true)}
    >
      <View style={[styles.avatar, styles.botAvatar]}>
        <Text style={styles.botEmoji}>🤖</Text>
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>PawBot</Text>
          <Text style={styles.timestamp}>🟢 Online</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {botMessageCount === 0 
              ? "Hi! I'm here to help with pet care questions 🐕"
              : `${botMessageCount} messages`}
          </Text>
          <Text style={styles.botBadge}>AI</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (selectedChatBot) {
    return (
      <ChatBotScreen
        onBack={() => {
          setSelectedChatBot(false);
          loadBotMessageCount(); // Refresh bot message count when returning
        }}
      />
    );
  }

  if (selectedConversation) {
    return (
      <ChatScreen
        conversationId={selectedConversation.conversation.id}
        otherUserEmail={selectedConversation.otherUserEmail}
        otherUserName={selectedConversation.otherUserName}
        onBack={() => {
          setSelectedConversation(null);
          loadConversations(false); // Refresh conversations when returning without loading
          loadUnreadCount(); // Refresh unread count
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <View style={styles.conversationsContainer}>
          {/* PawBot at the top */}
          {renderPawBotItem()}
          
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySubtitle}>
                Match with someone first, then you can start chatting! Go to your matches and tap &quot;Message&quot; to begin a conversation.
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.conversation.id}
              style={styles.conversationsList}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={loadConversations}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  headerBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center'
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24
  },
  conversationsList: {
    flex: 1
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  unreadItem: {
    backgroundColor: '#f0f9ff'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151'
  },
  conversationInfo: {
    flex: 1
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  unreadText: {
    fontWeight: '700'
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af'
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8
  },
  unreadBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center'
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600'
  },
  conversationsContainer: {
    flex: 1,
  },
  botAvatar: {
    backgroundColor: '#eff6ff',
  },
  botEmoji: {
    fontSize: 24,
  },
  botBadge: {
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  }
});