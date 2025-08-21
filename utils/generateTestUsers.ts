import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'owner' | 'sitter';
  profilePhoto?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  dogName?: string;
  dogBreed?: string;
  dogAge?: string;
  dogWeight?: string;
  dogSize?: 'small' | 'medium' | 'large' | 'extra_large';
  experience?: string;
  homeType?: 'apartment' | 'house' | 'house_with_yard';
  hasOtherPets?: boolean;
  maxDistance?: number;
  preferredSizes?: string[];
  needsSitting?: boolean;
  needsWalking?: boolean;
  providesSitting?: boolean;
  providesWalking?: boolean;
}

const sampleOwners: UserProfile[] = [
  {
    email: 'sarah.owner@test.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '555-0101',
    userType: 'owner',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    latitude: 37.7749,
    longitude: -122.4194,
    dogName: 'Buddy',
    dogBreed: 'Golden Retriever',
    dogAge: '3 years',
    dogWeight: '65 lbs',
    dogSize: 'large',
    needsSitting: true,
    needsWalking: true,
  },
  {
    email: 'mike.owner@test.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Chen',
    phone: '555-0102',
    userType: 'owner',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    latitude: 37.7849,
    longitude: -122.4094,
    dogName: 'Luna',
    dogBreed: 'French Bulldog',
    dogAge: '2 years',
    dogWeight: '25 lbs',
    dogSize: 'small',
    needsSitting: false,
    needsWalking: true,
  },
];

const sampleSitters: UserProfile[] = [
  {
    email: 'alex.sitter@test.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    phone: '555-0201',
    userType: 'sitter',
    address: '789 Pine St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    latitude: 37.7949,
    longitude: -122.3994,
    experience: '5+ years',
    homeType: 'house_with_yard',
    hasOtherPets: true,
    maxDistance: 10,
    preferredSizes: ['small', 'medium', 'large'],
    providesSitting: true,
    providesWalking: true,
  },
  {
    email: 'jenny.sitter@test.com',
    password: 'password123',
    firstName: 'Jenny',
    lastName: 'Kim',
    phone: '555-0202',
    userType: 'sitter',
    address: '321 Elm St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    latitude: 37.7649,
    longitude: -122.4294,
    experience: '2 years',
    homeType: 'apartment',
    hasOtherPets: false,
    maxDistance: 5,
    preferredSizes: ['small', 'medium'],
    providesSitting: false,
    providesWalking: true,
  },
];

export const generateTestUsers = async (): Promise<void> => {
  try {
    const allTestUsers = [...sampleOwners, ...sampleSitters];
    
    // Get existing users
    const existingUsersData = await AsyncStorage.getItem('pawpair_users');
    const existingUsers = existingUsersData ? JSON.parse(existingUsersData) : [];
    
    // Add test users that don't already exist
    const existingEmails = existingUsers.map((user: UserProfile) => user.email);
    const newUsers = allTestUsers.filter(user => !existingEmails.includes(user.email));
    
    if (newUsers.length > 0) {
      const updatedUsers = [...existingUsers, ...newUsers];
      await AsyncStorage.setItem('pawpair_users', JSON.stringify(updatedUsers));
      console.log(`Added ${newUsers.length} test users`);
    } else {
      console.log('All test users already exist');
    }
  } catch (error) {
    console.error('Error generating test users:', error);
  }
};

export const clearAllUsers = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('pawpair_users');
    await AsyncStorage.removeItem('pawpair_current_user');
    console.log('Cleared all users');
  } catch (error) {
    console.error('Error clearing users:', error);
  }
};

export const listAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersData = await AsyncStorage.getItem('pawpair_users');
    return usersData ? JSON.parse(usersData) : [];
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
};