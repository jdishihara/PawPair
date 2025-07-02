import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ConversationItem } from '../components/ConversationItem';
import { useMessaging } from '../hooks/useMessaging';
import { Conversation } from '../types/MessageTypes';

interface ConversationListScreenProps {
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export const ConversationListScreen: React.FC<ConversationListScreenProps> = ({
  onSelectConversation,
  currentUserId
}) => {
  const { conversations, archiveConversation } = useMessaging(currentUserId);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      currentUserId={currentUserId}
      onPress={() => onSelectConversation(item.id)}
      onArchive={() => archiveConversation(item.id)}
    />
  );

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Messages Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start swiping to find matches and begin conversations!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  }
});
export default ConversationListScreen;