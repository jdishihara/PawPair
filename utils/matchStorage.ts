import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../app/AuthFlow';
import { getCurrentUser, getUserByEmail } from './userStorage';

const SWIPES_KEY = 'pawpair_swipes';
const MATCHES_KEY = 'pawpair_matches';

export interface SwipeDecision {
  swiperId: string; // Email of person who swiped
  swipedId: string; // Email of person being swiped on
  decision: 'interested' | 'pass';
  timestamp: string;
}

export interface Match {
  id: string;
  user1Email: string;
  user2Email: string;
  matchedAt: string;
  lastMessageAt?: string;
}

export interface MatchWithProfiles {
  match: Match;
  otherUser: UserProfile;
}

// Get all swipe decisions
const getStoredSwipes = async (): Promise<SwipeDecision[]> => {
  try {
    const swipesJson = await AsyncStorage.getItem(SWIPES_KEY);
    return swipesJson ? JSON.parse(swipesJson) : [];
  } catch (error) {
    console.error('Error getting stored swipes:', error);
    return [];
  }
};

// Get all matches
const getStoredMatches = async (): Promise<Match[]> => {
  try {
    const matchesJson = await AsyncStorage.getItem(MATCHES_KEY);
    return matchesJson ? JSON.parse(matchesJson) : [];
  } catch (error) {
    console.error('Error getting stored matches:', error);
    return [];
  }
};

// Save a swipe decision
export const saveSwipeDecision = async (swipedUserEmail: string, decision: 'interested' | 'pass'): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }

    const swipes = await getStoredSwipes();
    
    // Check if user already swiped on this person
    const existingSwipeIndex = swipes.findIndex(
      swipe => swipe.swiperId === currentUser.email && swipe.swipedId === swipedUserEmail
    );

    const newSwipe: SwipeDecision = {
      swiperId: currentUser.email,
      swipedId: swipedUserEmail,
      decision,
      timestamp: new Date().toISOString()
    };

    if (existingSwipeIndex >= 0) {
      // Update existing swipe
      swipes[existingSwipeIndex] = newSwipe;
    } else {
      // Add new swipe
      swipes.push(newSwipe);
    }

    await AsyncStorage.setItem(SWIPES_KEY, JSON.stringify(swipes));

    // Check for mutual match if this was an "interested" swipe
    if (decision === 'interested') {
      await checkForMatch(currentUser.email, swipedUserEmail);
    }

    return true;
  } catch (error) {
    console.error('Error saving swipe decision:', error);
    return false;
  }
};

// Check if two users have a mutual match
const checkForMatch = async (user1Email: string, user2Email: string): Promise<void> => {
  try {
    const swipes = await getStoredSwipes();
    
    // Check if both users swiped "interested" on each other
    const user1SwipedInterested = swipes.some(
      swipe => swipe.swiperId === user1Email && 
               swipe.swipedId === user2Email && 
               swipe.decision === 'interested'
    );
    
    const user2SwipedInterested = swipes.some(
      swipe => swipe.swiperId === user2Email && 
               swipe.swipedId === user1Email && 
               swipe.decision === 'interested'
    );

    if (user1SwipedInterested && user2SwipedInterested) {
      // Create a match!
      await createMatch(user1Email, user2Email);
    }
  } catch (error) {
    console.error('Error checking for match:', error);
  }
};

// Create a new match
const createMatch = async (user1Email: string, user2Email: string): Promise<void> => {
  try {
    const matches = await getStoredMatches();
    
    // Check if match already exists
    const existingMatch = matches.find(
      match => (match.user1Email === user1Email && match.user2Email === user2Email) ||
               (match.user1Email === user2Email && match.user2Email === user1Email)
    );

    if (existingMatch) {
      console.log('Match already exists');
      return;
    }

    const newMatch: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user1Email,
      user2Email,
      matchedAt: new Date().toISOString()
    };

    matches.push(newMatch);
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    
    console.log('🎉 New match created between:', user1Email, 'and', user2Email);
  } catch (error) {
    console.error('Error creating match:', error);
  }
};

// Get matches for current user
export const getUserMatches = async (): Promise<MatchWithProfiles[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const matches = await getStoredMatches();
    
    // Filter matches that include current user
    const userMatches = matches.filter(
      match => match.user1Email === currentUser.email || match.user2Email === currentUser.email
    );

    // Get profile data for each match
    const matchesWithProfiles: MatchWithProfiles[] = [];
    
    for (const match of userMatches) {
      const otherUserEmail = match.user1Email === currentUser.email 
        ? match.user2Email 
        : match.user1Email;
      
      const otherUserProfile = await getUserByEmail(otherUserEmail);
      
      if (otherUserProfile) {
        matchesWithProfiles.push({
          match,
          otherUser: otherUserProfile
        });
      }
    }

    // Sort by most recent matches first
    matchesWithProfiles.sort((a, b) => 
      new Date(b.match.matchedAt).getTime() - new Date(a.match.matchedAt).getTime()
    );

    return matchesWithProfiles;
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

// Get users that current user has already swiped on
export const getSwipedUsers = async (): Promise<string[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const swipes = await getStoredSwipes();
    
    return swipes
      .filter(swipe => swipe.swiperId === currentUser.email)
      .map(swipe => swipe.swipedId);
  } catch (error) {
    console.error('Error getting swiped users:', error);
    return [];
  }
};

// Check if current user has swiped on a specific user
export const hasSwipedOn = async (userEmail: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const swipes = await getStoredSwipes();
    
    return swipes.some(
      swipe => swipe.swiperId === currentUser.email && swipe.swipedId === userEmail
    );
  } catch (error) {
    console.error('Error checking if swiped:', error);
    return false;
  }
};

// Get swipe decision for a specific user
export const getSwipeDecision = async (userEmail: string): Promise<'interested' | 'pass' | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const swipes = await getStoredSwipes();
    
    const swipe = swipes.find(
      swipe => swipe.swiperId === currentUser.email && swipe.swipedId === userEmail
    );

    return swipe ? swipe.decision : null;
  } catch (error) {
    console.error('Error getting swipe decision:', error);
    return null;
  }
};