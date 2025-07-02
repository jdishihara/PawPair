import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../app/AuthFlow';

const USERS_KEY = 'pawpair_users';
const CURRENT_USER_KEY = 'pawpair_current_user';

export interface StoredUser {
  email: string;
  password: string;
  profile: UserProfile;
  createdAt: string;
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
      email: profile.email,
      password: profile.password,
      profile,
      createdAt: new Date().toISOString()
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