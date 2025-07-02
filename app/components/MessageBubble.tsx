import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Message } from '../types/MessageTypes';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const timeString = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
      </View>
      
      <View style={[styles.footer, isOwn ? styles.ownFooter : styles.otherFooter]}>
        <Text style={styles.time}>{timeString}</Text>
        {isOwn && (
          <MaterialIcons 
            name={message.status === 'read' ? 'done-all' : 'done'} 
            size={14} 
            color={message.status === 'read' ? '#4CAF50' : '#666'} 
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16
  },
  ownMessage: {
    alignItems: 'flex-end'
  },
  otherMessage: {
    alignItems: 'flex-start'
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4
  },
  text: {
    fontSize: 16,
    lineHeight: 20
  },
  ownText: {
    color: '#fff'
  },
  otherText: {
    color: '#000'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4
  },
  ownFooter: {
    justifyContent: 'flex-end'
  },
  otherFooter: {
    justifyContent: 'flex-start'
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginRight: 4
  }
});
export default MessageBubble;