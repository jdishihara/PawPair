import React, { useState } from 'react';
import { ChatScreen } from './screens/ChatScreen';
import { ConversationListScreen } from './screens/ConversationListScreen';

export default function MessagesScreen() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const currentUserId = '2'; // This should come from your auth context

  if (selectedConversationId) {
    return (
      <ChatScreen
        conversationId={selectedConversationId}
        currentUserId={currentUserId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  return (
    <ConversationListScreen
      onSelectConversation={setSelectedConversationId}
      currentUserId={currentUserId}
    />
  );
}