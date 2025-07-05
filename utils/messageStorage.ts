import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './userStorage';

const CONVERSATIONS_KEY = 'pawpair_conversations';
const MESSAGES_KEY = 'pawpair_messages';
const BOT_MESSAGES_KEY = 'pawpair_bot_messages';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user1Email: string;
  user2Email: string;
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
}

export interface ConversationWithProfile {
  conversation: Conversation;
  otherUserEmail: string;
  otherUserName: string;
}

export interface BotMessage {
  id: string;
  userEmail: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

// Get all conversations
const getStoredConversations = async (): Promise<Conversation[]> => {
  try {
    const conversationsJson = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return conversationsJson ? JSON.parse(conversationsJson) : [];
  } catch (error) {
    console.error('Error getting stored conversations:', error);
    return [];
  }
};

// Get all messages
const getStoredMessages = async (): Promise<Message[]> => {
  try {
    const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error('Error getting stored messages:', error);
    return [];
  }
};

// Create or get conversation between two users
export const getOrCreateConversation = async (otherUserEmail: string): Promise<string | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return null;
    }

    const conversations = await getStoredConversations();
    
    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => (conv.user1Email === currentUser.email && conv.user2Email === otherUserEmail) ||
              (conv.user1Email === otherUserEmail && conv.user2Email === currentUser.email)
    );

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user1Email: currentUser.email,
      user2Email: otherUserEmail,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: 0
    };

    conversations.push(newConversation);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    
    console.log('✅ New conversation created:', newConversation.id);
    return newConversation.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Send a message
export const sendMessage = async (conversationId: string, receiverEmail: string, content: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }

    const messages = await getStoredMessages();
    const conversations = await getStoredConversations();

    // Create new message
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: currentUser.email,
      receiverId: receiverEmail,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Update conversation with last message
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex >= 0) {
      conversations[conversationIndex].lastMessage = newMessage;
      conversations[conversationIndex].lastMessageAt = newMessage.timestamp;
      
      // Increment unread count for receiver
      if (conversations[conversationIndex].user1Email === receiverEmail) {
        conversations[conversationIndex].unreadCount += 1;
      } else if (conversations[conversationIndex].user2Email === receiverEmail) {
        conversations[conversationIndex].unreadCount += 1;
      }

      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }

    console.log('✅ Message sent:', newMessage.id);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messages = await getStoredMessages();
    
    const conversationMessages = messages
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return conversationMessages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
};

// Get all conversations for current user
export const getUserConversations = async (): Promise<ConversationWithProfile[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const conversations = await getStoredConversations();
    
    // Filter conversations that include current user
    const userConversations = conversations.filter(
      conv => conv.user1Email === currentUser.email || conv.user2Email === currentUser.email
    );

    // Map to include other user info
    const conversationsWithProfiles = userConversations.map(conv => {
      const otherUserEmail = conv.user1Email === currentUser.email 
        ? conv.user2Email 
        : conv.user1Email;
      
      return {
        conversation: conv,
        otherUserEmail,
        otherUserName: otherUserEmail.split('@')[0] // Simple name extraction
      };
    });

    // Sort by most recent activity
    conversationsWithProfiles.sort((a, b) => 
      new Date(b.conversation.lastMessageAt).getTime() - new Date(a.conversation.lastMessageAt).getTime()
    );

    return conversationsWithProfiles;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

// Mark messages in conversation as read
export const markConversationAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const messages = await getStoredMessages();
    const conversations = await getStoredConversations();

    // Mark all messages from other user as read
    let hasUpdates = false;
    const updatedMessages = messages.map(message => {
      if (message.conversationId === conversationId && 
          message.receiverId === currentUser.email && 
          !message.read) {
        hasUpdates = true;
        return { ...message, read: true };
      }
      return message;
    });

    if (hasUpdates) {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
    }

    // Reset unread count for current user
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex >= 0) {
      conversations[conversationIndex].unreadCount = 0;
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }

    return true;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return false;
  }
};

// Get total unread count for current user
export const getTotalUnreadCount = async (): Promise<number> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return 0;
    }

    const messages = await getStoredMessages();
    
    const unreadCount = messages.filter(
      message => message.receiverId === currentUser.email && !message.read
    ).length;

    return unreadCount;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
};

// Delete a conversation and all its messages
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const messages = await getStoredMessages();
    const conversations = await getStoredConversations();

    // Remove all messages for this conversation
    const filteredMessages = messages.filter(message => message.conversationId !== conversationId);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));

    // Remove conversation
    const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));

    console.log('✅ Conversation deleted:', conversationId);
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

// Bot message functions
const getStoredBotMessages = async (): Promise<BotMessage[]> => {
  try {
    const messagesJson = await AsyncStorage.getItem(BOT_MESSAGES_KEY);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error('Error getting stored bot messages:', error);
    return [];
  }
};

export const saveBotMessage = async (content: string, isBot: boolean): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }

    const messages = await getStoredBotMessages();
    
    const newMessage: BotMessage = {
      id: `bot_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: currentUser.email,
      content: content.trim(),
      isBot,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    await AsyncStorage.setItem(BOT_MESSAGES_KEY, JSON.stringify(messages));
    
    return true;
  } catch (error) {
    console.error('Error saving bot message:', error);
    return false;
  }
};

export const getBotMessages = async (): Promise<BotMessage[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const messages = await getStoredBotMessages();
    
    return messages
      .filter(message => message.userEmail === currentUser.email)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error getting bot messages:', error);
    return [];
  }
};

export const clearBotMessages = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const messages = await getStoredBotMessages();
    const filteredMessages = messages.filter(message => message.userEmail !== currentUser.email);
    
    await AsyncStorage.setItem(BOT_MESSAGES_KEY, JSON.stringify(filteredMessages));
    return true;
  } catch (error) {
    console.error('Error clearing bot messages:', error);
    return false;
  }
};