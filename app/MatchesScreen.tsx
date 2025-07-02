// app/MatchesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getUserMatches, MatchWithProfiles } from '../utils/matchStorage';
import UserProfileView from './UserProfileView';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfiles | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const userMatches = await getUserMatches();
      setMatches(userMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMatchCard = ({ item }: { item: MatchWithProfiles }) => {
    const isOwner = item.otherUser.userType === 'owner';
    const displayName = `${item.otherUser.firstName} ${item.otherUser.lastName}`;
    const subtitle = isOwner 
      ? `Dog: ${item.otherUser.dogName || 'Unnamed'} (${item.otherUser.dogBreed || 'Mixed'})`
      : `Sitter • ${item.otherUser.experience || 'Dog lover'}`;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => setSelectedMatch(item)}
      >
        <View style={styles.matchAvatar}>
          <Text style={styles.avatarEmoji}>
            {isOwner ? '🐕' : '❤️'}
          </Text>
        </View>
        
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>{displayName}</Text>
            <Text style={styles.matchTime}>
              {formatMatchDate(item.match.matchedAt)}
            </Text>
          </View>
          
          <Text style={styles.matchSubtitle}>{subtitle}</Text>
          
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>✨ It&apos;s a Match!</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={async () => {
            const { getOrCreateConversation } = await import('../utils/messageStorage');
            const conversationId = await getOrCreateConversation(item.otherUser.email);
            if (conversationId) {
              console.log('Navigate to conversation:', conversationId, 'with', item.otherUser.firstName);
              alert(`Conversation started with ${item.otherUser.firstName}! Check your Messages tab.`);
            } else {
              alert('Failed to start conversation. Please try again.');
            }
          }}
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (selectedMatch) {
    return (
      <UserProfileView
        userProfile={selectedMatch.otherUser}
        onBack={() => setSelectedMatch(null)}
        onMessage={async () => {
          const { getOrCreateConversation } = await import('../utils/messageStorage');
          const conversationId = await getOrCreateConversation(selectedMatch.otherUser.email);
          if (conversationId) {
            // Navigate to Messages tab and open this conversation
            // For now, we'll just log it - in a real app you'd use navigation
            console.log('Navigate to conversation:', conversationId, 'with', selectedMatch.otherUser.firstName);
            alert(`Conversation started with ${selectedMatch.otherUser.firstName}! Check your Messages tab.`);
          } else {
            alert('Failed to start conversation. Please try again.');
          }
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Matches</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading your matches...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep swiping to find your perfect match! When someone you&apos;re interested in also swipes right on you, you&apos;ll see them here.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadMatches}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              You have {matches.length} match{matches.length === 1 ? '' : 'es'}! 🎉
            </Text>
          </View>
          
          <FlatList
            data={matches}
            renderItem={renderMatchCard}
            keyExtractor={(item) => item.match.id}
            style={styles.matchesList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadMatches}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  statsContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center'
  },
  statsText: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600'
  },
  matchesList: {
    flex: 1
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarEmoji: {
    fontSize: 24
  },
  matchInfo: {
    flex: 1
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  matchTime: {
    fontSize: 12,
    color: '#9ca3af'
  },
  matchSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8
  },
  matchBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  matchBadgeText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600'
  },
  messageButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});