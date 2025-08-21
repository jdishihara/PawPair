import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../app/AuthFlow';

const USERS_KEY = 'pawpair_users';
const CURRENT_USER_KEY = 'pawpair_current_user';

export interface StoredUser {
  id: string; // Add unique ID for each user
  email: string;
  password: string;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string; // Track when profile was last updated
}

// Get all registered users
export const getStoredUsers = async (): Promise<StoredUser[]> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error getting stored users:', error);
    return [];
  }
};

// Save a new user profile
export const saveUserProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const users = await getStoredUsers();
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.email === profile.email);
    
    const newUser: StoredUser = {
      id: existingUserIndex >= 0 ? users[existingUserIndex].id : Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: profile.email,
      password: profile.password,
      profile,
      createdAt: existingUserIndex >= 0 ? users[existingUserIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = newUser;
    } else {
      // Add new user
      users.push(newUser);
    }
    
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

// Validate login credentials
export const validateLogin = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    const users = await getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user ? user.profile : null;
  } catch (error) {
    console.error('Error validating login:', error);
    return null;
  }
};

// Save current logged-in user
export const setCurrentUser = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Get current logged-in user
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Clear current user (logout)
export const clearCurrentUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Check if email is already registered
export const isEmailRegistered = async (email: string): Promise<boolean> => {
  try {
    const users = await getStoredUsers();
    return users.some(user => user.email === email);
  } catch (error) {
    console.error('Error checking email registration:', error);
    return false;
  }
};

// Search users by name, email, or other criteria
export const searchUsers = async (query: string, userType?: 'owner' | 'sitter'): Promise<UserProfile[]> => {
  try {
    const users = await getStoredUsers();
    const currentUser = await getCurrentUser();
    
    if (!query.trim()) {
      return [];
    }
    
    const lowercaseQuery = query.toLowerCase();
    
    return users
      .filter(user => {
        // Don't include current user in search results
        if (currentUser && user.email === currentUser.email) {
          return false;
        }
        
        // Filter by user type if specified
        if (userType && user.profile.userType !== userType) {
          return false;
        }
        
        // Search in various fields
        const searchableText = [
          user.profile.firstName,
          user.profile.lastName,
          user.profile.email,
          user.profile.dogName,
          user.profile.dogBreed,
          user.profile.experience,
          user.profile.dogTemperament
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(lowercaseQuery);
      })
      .map(user => user.profile);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Get all users of a specific type (excluding current user)
export const getUsersByType = async (userType: 'owner' | 'sitter'): Promise<UserProfile[]> => {
  try {
    const users = await getStoredUsers();
    const currentUser = await getCurrentUser();
    
    return users
      .filter(user => {
        return user.profile.userType === userType && 
               (!currentUser || user.email !== currentUser.email);
      })
      .map(user => user.profile);
  } catch (error) {
    console.error('Error getting users by type:', error);
    return [];
  }
};

// Get user profile by email
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const users = await getStoredUsers();
    const user = users.find(u => u.email === email);
    return user ? user.profile : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Update current user's profile
export const updateUserProfile = async (updatedProfile: UserProfile): Promise<boolean> => {
  try {
    const users = await getStoredUsers();
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }
    
    // Find and update the user in the stored users list
    const userIndex = users.findIndex(user => user.email === currentUser.email);
    if (userIndex === -1) {
      console.error('Current user not found in stored users');
      return false;
    }
    
    // Update the user's profile while keeping the original email and password
    users[userIndex] = {
      ...users[userIndex],
      profile: {
        ...updatedProfile,
        email: currentUser.email, // Keep original email
        password: currentUser.password // Keep original password
      }
    };
    
    // Save updated users list
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current user session
    await setCurrentUser(users[userIndex].profile);
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Get all user profiles (excluding current user)
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const users = await getStoredUsers();
    return users.map(user => user.profile);
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    return [];
  }
};

// Clear all stored user data (for debugging/development)
export const clearAllUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USERS_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ All user data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
  }
};

// Get account statistics
export const getAccountStatistics = async (): Promise<{
  totalUsers: number;
  owners: number;
  sitters: number;
  verifiedUsers: number;
  usersWithPhotos: number;
  recentSignups: number; // Last 7 days
}> => {
  try {
    const users = await getStoredUsers();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalUsers: users.length,
      owners: users.filter(u => u.profile.userType === 'owner').length,
      sitters: users.filter(u => u.profile.userType === 'sitter').length,
      verifiedUsers: users.filter(u => u.profile.phone && u.profile.firstName && u.profile.lastName).length,
      usersWithPhotos: users.filter(u => u.profile.profilePhoto).length,
      recentSignups: users.filter(u => new Date(u.createdAt) > oneWeekAgo).length
    };
  } catch (error) {
    console.error('Error getting account statistics:', error);
    return {
      totalUsers: 0,
      owners: 0,
      sitters: 0,
      verifiedUsers: 0,
      usersWithPhotos: 0,
      recentSignups: 0
    };
  }
};

// Export account data (for backup/debugging)
export const exportAccountData = async (): Promise<string> => {
  try {
    const users = await getStoredUsers();
    const currentUser = await getCurrentUser();
    const stats = await getAccountStatistics();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      currentUser: currentUser ? { email: currentUser.email, userType: currentUser.userType } : null,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        userType: user.profile.userType,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasProfilePhoto: !!user.profile.profilePhoto,
        location: user.profile.city && user.profile.state ? `${user.profile.city}, ${user.profile.state}` : 'Not provided'
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting account data:', error);
    return JSON.stringify({ error: 'Failed to export data' }, null, 2);
  }
};

// Clear ALL app data - users, matches, messages, availability
export const clearAllAppData = async (): Promise<void> => {
  try {
    // User data
    await AsyncStorage.removeItem(USERS_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    
    // Messages and conversations
    await AsyncStorage.removeItem('pawpair_conversations');
    await AsyncStorage.removeItem('pawpair_messages');
    await AsyncStorage.removeItem('pawpair_bot_messages');
    
    // Matches and swipes
    await AsyncStorage.removeItem('pawpair_swipes');
    await AsyncStorage.removeItem('pawpair_matches');
    
    // Availability
    await AsyncStorage.removeItem('pawpair_availability');
    
    console.log('✅ ALL app data cleared successfully (users, matches, messages, bot messages, availability)');
  } catch (error) {
    console.error('❌ Error clearing all app data:', error);
  }
};