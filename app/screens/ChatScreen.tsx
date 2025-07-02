import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { useMessaging } from '../hooks/useMessaging';
import { Message } from '../types/MessageTypes';

interface ChatScreenProps {
  conversationId: string;
  currentUserId: string;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId,
  currentUserId,
  onBack
}) => {
  const { 
    conversations, 
    messages, 
    loadMessages, 
    sendMessage, 
    markAsRead 
  } = useMessaging(currentUserId);

  const conversation = conversations.find(c => c.id === conversationId);
  const chatMessages = messages[conversationId] || [];
  const otherUser = conversation?.participants.find(p => p.id !== currentUserId);

  useEffect(() => {
    loadMessages(conversationId);
    markAsRead(conversationId);
  }, [conversationId, loadMessages, markAsRead]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === currentUserId}
    />
  );

  if (!conversation || !otherUser) {
    return (
      <View style={styles.errorContainer}>
        <Text>Conversation not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            <Text style={styles.headerStatus}>
              {otherUser.isVerified ? '✓ Verified' : 'Active now'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <ChatInput onSend={(content) => sendMessage(conversationId, content)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    marginRight: 12
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50'
  },
  moreButton: {
    padding: 4
  },
  messagesList: {
    flex: 1
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ChatScreen;