// app/SearchScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { UserProfile } from './AuthFlow';
import UserProfileView from './UserProfileView';
import { getCurrentUser, getUsersByType, searchUsers } from '../utils/userStorage';

export default function SearchScreen() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'owners' | 'sitters'>('all');

  useEffect(() => {
    loadCurrentUser();
    loadAllUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const owners = await getUsersByType('owner');
      const sitters = await getUsersByType('sitter');
      const combined = [...owners, ...sitters];
      setAllUsers(combined);
      setSearchResults(combined);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      if (query.trim() === '') {
        // Show all users when search is empty
        setSearchResults(allUsers);
      } else {
        // Search with query
        const results = await searchUsers(query);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = async (tab: 'all' | 'owners' | 'sitters') => {
    setActiveTab(tab);
    setLoading(true);
    
    try {
      let results: UserProfile[] = [];
      
      if (tab === 'all') {
        results = allUsers;
      } else if (tab === 'owners') {
        results = await getUsersByType('owner');
      } else if (tab === 'sitters') {
        results = await getUsersByType('sitter');
      }
      
      setSearchResults(results);
      
      // If there's a search query, filter the results
      if (searchQuery.trim()) {
        const userType = tab === 'all' ? undefined : tab.slice(0, -1) as 'owner' | 'sitter';
        const searchResults = await searchUsers(searchQuery, userType);
        setSearchResults(searchResults);
      }
    } catch (error) {
      console.error('Error filtering users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userType}>
          {item.userType === 'owner' ? '🐕 Dog Owner' : '❤️ Dog Sitter'}
        </Text>
        {item.userType === 'owner' && item.dogName && (
          <Text style={styles.dogInfo}>Dog: {item.dogName} ({item.dogBreed})</Text>
        )}
        {item.userType === 'sitter' && item.experience && (
          <Text style={styles.experience}>Experience: {item.experience}</Text>
        )}
        {item.userType === 'sitter' && (
          <View style={styles.availabilityInfo}>
            {item.shortNotice && (
              <Text style={styles.availabilityTag}>⚡ Short Notice</Text>
            )}
            {item.overnightCare && (
              <Text style={styles.availabilityTag}>🌙 Overnight</Text>
            )}
            {item.weekendCare && (
              <Text style={styles.availabilityTag}>📅 Weekends</Text>
            )}
            {item.preferredStartTime && item.preferredEndTime && (
              <Text style={styles.timeInfo}>
                Usually available: {item.preferredStartTime} - {item.preferredEndTime}
              </Text>
            )}
          </View>
        )}
      </View>
      <Text style={styles.viewProfile}>View →</Text>
    </TouchableOpacity>
  );

  if (selectedUser) {
    return (
      <UserProfileView
        userProfile={selectedUser}
        onBack={() => setSelectedUser(null)}
        onMessage={() => {
          // TODO: Navigate to messages
          console.log('Navigate to messages with', selectedUser.email);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Users</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, dog breed, experience..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabPress('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'owners' && styles.activeTab]}
          onPress={() => handleTabPress('owners')}
        >
          <Text style={[styles.tabText, activeTab === 'owners' && styles.activeTabText]}>
            Dog Owners
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sitters' && styles.activeTab]}
          onPress={() => handleTabPress('sitters')}
        >
          <Text style={[styles.tabText, activeTab === 'sitters' && styles.activeTabText]}>
            Dog Sitters
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.email}
          style={styles.userList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found matching your search' : 'No users found'}
              </Text>
            </View>
          }
        />
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9fafb'
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#2563eb'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  activeTabText: {
    color: '#fff'
  },
  userList: {
    flex: 1
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  userType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  dogInfo: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500'
  },
  experience: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500'
  },
  availabilityInfo: {
    marginTop: 8
  },
  availabilityTag: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
    alignSelf: 'flex-start'
  },
  timeInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  viewProfile: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500'
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
    paddingTop: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  }
});