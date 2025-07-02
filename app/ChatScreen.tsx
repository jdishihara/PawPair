import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  getConversationMessages,
  markConversationAsRead,
  sendMessage,
  Message
} from '../utils/messageStorage';
import { getCurrentUser } from '../utils/userStorage';

interface ChatScreenProps {
  conversationId: string;
  otherUserEmail: string;
  otherUserName: string;
  onBack: () => void;
}

export default function ChatScreen({
  conversationId,
  otherUserEmail,
  otherUserName,
  onBack
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    markAsRead();

    // Set up polling for new messages
    const interval = setInterval(() => {
      loadMessages(false); // Don't show loading when polling
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const conversationMessages = await getConversationMessages(conversationId);
      setMessages(conversationMessages);
      
      // Scroll to bottom when messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const success = await sendMessage(conversationId, otherUserEmail, messageContent);
      if (success) {
        await loadMessages(false); // Refresh messages without loading indicator
        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setNewMessage(messageContent); // Restore message if sending failed
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message if sending failed
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = currentUser && item.senderId === currentUser.email;
    const showTime = index === 0 || 
      (messages[index - 1] && 
       new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000); // 5 minutes

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <Text style={styles.messageTime}>
            {formatMessageTime(item.timestamp)}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.ownMessage : styles.otherMessage
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.ownMessageText : styles.otherMessageText
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.avatarText}>
                {otherUserName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.headerName}>{otherUserName}</Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <MaterialIcons 
                name="send" 
                size={20} 
                color={(!newMessage.trim() || sending) ? "#9ca3af" : "#2563eb"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff'
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  headerStatus: {
    fontSize: 12,
    color: '#16a34a'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280'
  },
  messagesList: {
    flex: 1
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8
  },
  messageContainer: {
    marginVertical: 4
  },
  messageTime: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 16
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 2
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20
  },
  ownMessageText: {
    color: '#fff'
  },
  otherMessageText: {
    color: '#111827'
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    paddingVertical: 8
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.5
  }
});