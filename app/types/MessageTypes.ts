export interface User {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  userType: 'owner' | 'sitter';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'booking_request';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    imageUrl?: string;
    location?: { latitude: number; longitude: number; address: string };
    bookingDetails?: {
      dates: string[];
      duration: string;
      price: number;
    };
  };
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
  matchedAt?: Date;
}
export default {};