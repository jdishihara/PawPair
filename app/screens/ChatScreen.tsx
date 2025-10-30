import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { BookingRequestModal } from '../../components/BookingRequestModal';
import { BookingRequestCard } from '../../components/BookingRequestCard';
import { useMessaging } from '../hooks/useMessaging';
import { Message } from '../types/MessageTypes';
import { getBookingRequest, BookingRequest } from '../../utils/messageStorage';
import { getCurrentUser } from '../../utils/userStorage';

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

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<Map<string, BookingRequest>>(new Map());
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [otherUserEmail, setOtherUserEmail] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  const conversation = conversations.find(c => c.id === conversationId);
  const chatMessages = messages[conversationId] || [];
  const otherUser = conversation?.participants.find(p => p.id !== currentUserId);

  useEffect(() => {
    loadMessages(conversationId);
    markAsRead(conversationId);
    loadUserInfo();
  }, [conversationId]);

  const loadUserInfo = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUserEmail(user.email);
      setIsOwner(user.userType === 'owner');

      // Find other user's email from conversation
      if (conversation) {
        const otherEmail = conversation.participants.find(p => p.id !== currentUserId)?.id || '';
        setOtherUserEmail(otherEmail);
      }
    }
  };

  // Load booking requests for messages that have them
  useEffect(() => {
    const loadBookingRequests = async () => {
      const requests = new Map<string, BookingRequest>();

      for (const msg of chatMessages) {
        if (msg.bookingRequestId) {
          const booking = await getBookingRequest(msg.bookingRequestId);
          if (booking) {
            requests.set(msg.bookingRequestId, booking);
          }
        }
      }

      setBookingRequests(requests);
    };

    if (chatMessages.length > 0) {
      loadBookingRequests();
    }
  }, [chatMessages]);

  const handleBookingRequestSuccess = () => {
    // Reload messages to show the new booking request
    loadMessages(conversationId);
  };

  const handleBookingStatusUpdate = () => {
    // Reload messages and booking requests
    loadMessages(conversationId);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // If this is a booking request message, render the booking card
    if (item.messageType === 'booking_request' && item.bookingRequestId) {
      const booking = bookingRequests.get(item.bookingRequestId);
      if (booking) {
        return (
          <View style={styles.messageContainer}>
            <BookingRequestCard
              bookingRequest={booking}
              isOwner={booking.requesterId === currentUserEmail}
              onStatusUpdate={handleBookingStatusUpdate}
            />
          </View>
        );
      }
    }

    // Regular text message
    return (
      <MessageBubble
        message={item}
        isOwn={item.senderId === currentUserId}
      />
    );
  };

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
        
        <View style={styles.headerActions}>
          {isOwner && (
            <TouchableOpacity
              style={styles.bookingButton}
              onPress={() => setShowBookingModal(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>
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

      {/* Booking Request Modal */}
      {otherUser && (
        <BookingRequestModal
          visible={showBookingModal}
          conversationId={conversationId}
          sitterEmail={otherUserEmail}
          sitterName={otherUser.name}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingRequestSuccess}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bookingButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#eff6ff'
  },
  moreButton: {
    padding: 4
  },
  messagesList: {
    flex: 1
  },
  messageContainer: {
    paddingHorizontal: 12,
    marginVertical: 4
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ChatScreen;