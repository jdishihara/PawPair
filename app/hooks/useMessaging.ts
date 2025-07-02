import { useCallback, useState } from 'react';
import { Conversation, Message, User } from '../types/MessageTypes';

// Mock data - replace with real API calls
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Sarah',
    isVerified: true,
    userType: 'sitter'
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Mike',
    isVerified: false,
    userType: 'owner'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Emma',
    isVerified: true,
    userType: 'sitter'
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: '1',
      content: 'Hi! I\'d love to help with your dog. When do you need care?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'read'
    },
    unreadCount: 0,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    id: 'conv2',
    participants: [mockUsers[2], mockUsers[1]],
    lastMessage: {
      id: 'msg2',
      conversationId: 'conv2',
      senderId: '3',
      content: 'Your dog is adorable! I have experience with golden retrievers.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: 'delivered'
    },
    unreadCount: 2,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }
];

export const useMessaging = (currentUserId: string = '2') => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [isTyping, setIsTyping] = useState<{ [conversationId: string]: boolean }>({});

  // Load messages for a conversation
  const loadMessages = useCallback((conversationId: string) => {
    // Mock messages - replace with API call
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        conversationId,
        senderId: conversationId === 'conv1' ? '1' : '3',
        content: 'Hi! I\'d love to help with your dog.',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'read'
      },
      {
        id: 'msg2',
        conversationId,
        senderId: currentUserId,
        content: 'That sounds great! When are you available?',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        status: 'read'
      },
      {
        id: 'msg3',
        conversationId,
        senderId: conversationId === 'conv1' ? '1' : '3',
        content: 'I\'m free this weekend. Would Saturday work?',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'read'
      }
    ];

    setMessages(prev => ({
      ...prev,
      [conversationId]: mockMessages
    }));
  }, [currentUserId]);

  // Send a new message
  const sendMessage = useCallback((conversationId: string, content: string, type: 'text' | 'image' = 'text') => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      content,
      type,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage }
          : conv
      )
    );

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ) || []
      }));
    }, 1000);
  }, [currentUserId]);

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  }, []);

  // Archive conversation
  const archiveConversation = useCallback((conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isArchived: true }
          : conv
      )
    );
  }, []);

  return {
    conversations: conversations.filter(conv => !conv.isArchived),
    messages,
    isTyping,
    loadMessages,
    sendMessage,
    markAsRead,
    archiveConversation
  };
};
export default useMessaging;