// app/ChatBotScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { chatBotService } from '../utils/chatBotService';
import { saveBotMessage, getBotMessages, clearBotMessages, BotMessage } from '../utils/messageStorage';

type ChatBotScreenProps = {
  onBack: () => void;
};

export default function ChatBotScreen({ onBack }: ChatBotScreenProps) {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const botMessages = await getBotMessages();
      setMessages(botMessages);
      
      // Show welcome message if no previous conversation
      if (botMessages.length === 0) {
        const welcomeMessage: BotMessage = {
          id: 'welcome',
          userEmail: 'bot',
          content: "Hi! I'm PawBot 🐕 I'm here to help with pet care questions and PawPair app features. What would you like to know?",
          isBot: true,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading bot messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // Add user message to UI immediately
      const userBotMessage: BotMessage = {
        id: `user_${Date.now()}`,
        userEmail: 'user',
        content: userMessage,
        isBot: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userBotMessage]);
      
      // Save user message to storage
      await saveBotMessage(userMessage, false);

      // Get bot response (use demo mode if no API key)
      let botResponse: string;
      try {
        // Try real API first
        botResponse = await chatBotService.sendMessage(userMessage);
      } catch (error) {
        // Fallback to demo mode
        console.log('Using demo mode for chatbot');
        botResponse = await chatBotService.sendMessageDemo(userMessage);
      }

      // Add bot response to UI
      const botBotMessage: BotMessage = {
        id: `bot_${Date.now()}`,
        userEmail: 'bot',
        content: botResponse,
        isBot: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botBotMessage]);
      
      // Save bot message to storage
      await saveBotMessage(botResponse, true);

    } catch (error) {
      console.error('Error sending message to bot:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear your conversation with PawBot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearBotMessages();
            chatBotService.clearHistory();
            await loadMessages(); // Reload to show welcome message
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: BotMessage) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isBot ? styles.botMessage : styles.userMessage
    ]}>
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.timeText,
          message.isBot ? styles.botTimeText : styles.userTimeText
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.botAvatar}>
            <MaterialIcons name="smart-toy" size={20} color="#2563eb" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.botName}>PawBot</Text>
            <Text style={styles.onlineStatus}>🟢 Online</Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
          <MaterialIcons name="refresh" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color="#6b7280" />
              <Text style={styles.typingText}>PawBot is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about pet care or PawPair..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={(!inputText.trim() || isLoading) ? "#9ca3af" : "#2563eb"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 6,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#374151',
  },
  userText: {
    color: '#ffffff',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  botTimeText: {
    color: '#9ca3af',
  },
  userTimeText: {
    color: '#bfdbfe',
  },
  typingText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
});