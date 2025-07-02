import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Conversation } from '../types/MessageTypes';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
  onArchive: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  onPress,
  onArchive
}) => {
  const otherUser = conversation.participants.find(p => p.id !== currentUserId);
  const timeAgo = getTimeAgo(conversation.lastMessage?.timestamp || conversation.createdAt);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: otherUser?.avatar }} style={styles.avatar} />
        {otherUser?.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={12} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{otherUser?.name}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.content || 'You matched!'}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity onPress={onArchive} style={styles.archiveButton}>
        <MaterialIcons name="archive" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  archiveButton: {
    padding: 8,
    justifyContent: 'center'
  }
});
export default ConversationItem;