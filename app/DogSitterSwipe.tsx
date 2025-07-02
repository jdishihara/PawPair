import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { UserProfile } from './AuthFlow';
import { getUsersByType } from '../utils/userStorage';
import { getSwipedUsers, saveSwipeDecision } from '../utils/matchStorage';
import { useSearch } from '../contexts/SearchContext';

const FlipCard = ({ profile }: { profile: UserProfile }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg']
  });

  const flip = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={flip}>
      <View style={styles.card}>
        {/* Front of card - Sitter Info */}
        <Animated.View 
          style={[
            styles.cardFace, 
            { transform: [{ rotateY: frontRotateY }] }
          ]}
        >
          <View style={styles.sitterImagePlaceholder}>
            <Text style={styles.sitterEmoji}>❤️</Text>
          </View>
          <Text style={styles.sitterName}>{profile.firstName} {profile.lastName}</Text>
          {profile.experience && (
            <Text style={styles.experience}>Experience: {profile.experience}</Text>
          )}
          {profile.maxDistance && (
            <Text style={styles.sitterInfo}>Travels up to {profile.maxDistance} miles</Text>
          )}
          <Text style={styles.contactInfo}>📞 {profile.phone}</Text>
          <Text style={styles.hint}>Tap to see more details</Text>
        </Animated.View>

        {/* Back of card - Detailed Info */}
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardBack, 
            { transform: [{ rotateY: backRotateY }] }
          ]}
        >
          <Text style={styles.sitterName}>{profile.firstName} {profile.lastName}</Text>
          
          <View style={styles.contactSection}>
            <Text style={styles.contactInfo}>📞 {profile.phone}</Text>
            <Text style={styles.contactInfo}>📧 {profile.email}</Text>
          </View>
          
          {profile.experience && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <Text style={styles.sectionContent}>{profile.experience}</Text>
            </View>
          )}
          
          {profile.maxDistance && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Service Area</Text>
              <Text style={styles.sectionContent}>Travels up to {profile.maxDistance} miles</Text>
            </View>
          )}
          
          {profile.homeType && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Home Environment</Text>
              <Text style={styles.sectionContent}>
                {profile.homeType.replace(/_/g, ' ')}
                {profile.hasOtherPets !== undefined && 
                  ` • ${profile.hasOtherPets ? 'Has other pets' : 'No other pets'}`
                }
              </Text>
            </View>
          )}
          
          <Text style={styles.hint}>Tap to flip back</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function DogSitterSwipe() {
  const [dogSitters, setDogSitters] = useState<UserProfile[]>([]);
  const [swipeLabel, setSwipeLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { openSearch } = useSearch();

  useEffect(() => {
    loadDogSitters();
  }, []);

  const loadDogSitters = async () => {
    try {
      const sitters = await getUsersByType('sitter');
      
      // Filter out users already swiped on
      const swipedUserEmails = await getSwipedUsers();
      const unswipedSitters = sitters.filter(sitter => 
        !swipedUserEmails.includes(sitter.email)
      );
      
      setDogSitters(unswipedSitters);
    } catch (error) {
      console.error('Error loading dog sitters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (index: number) => {
    const sitter = dogSitters[index];
    if (sitter) {
      console.log('Interested in sitter:', sitter.firstName, sitter.lastName);
      
      const success = await saveSwipeDecision(sitter.email, 'interested');
      if (success) {
        console.log('✅ Swipe decision saved');
      } else {
        Alert.alert('Error', 'Failed to save your interest. Please try again.');
      }
    }
    setSwipeLabel(null);
  };

  const handleSwipeLeft = async (index: number) => {
    const sitter = dogSitters[index];
    if (sitter) {
      console.log('Passed on sitter:', sitter.firstName, sitter.lastName);
      
      const success = await saveSwipeDecision(sitter.email, 'pass');
      if (success) {
        console.log('✅ Pass decision saved');
      } else {
        Alert.alert('Error', 'Failed to save your decision. Please try again.');
      }
    }
    setSwipeLabel(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading available sitters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with search button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Sitters</Text>
        <TouchableOpacity onPress={openSearch} style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {swipeLabel && (
        <View style={styles.overlay}>
          <Text style={swipeLabel === 'PASS ❌' ? styles.pass : styles.interested}>
            {swipeLabel}
          </Text>
        </View>
      )}
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Swipe right if you&apos;d like this sitter to care for your dog!</Text>
      </View>
      
      <Swiper
        cards={dogSitters}
        renderCard={(sitter: UserProfile | undefined) => {
          if (!sitter) {
            return (
              <View style={[styles.card, styles.centered]}>
                <Text style={styles.emptyTitle}>No more sitters! ❤️</Text>
                <Text style={styles.emptySubtitle}>Check back later for new caregivers</Text>
              </View>
            );
          }

          return <FlipCard profile={sitter} />;
        }}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwiping={(x: number) => {
          if (x > 50) {
            setSwipeLabel('INTERESTED ❤️');
          } else if (x < -50) {
            setSwipeLabel('PASS ❌');
          } else {
            setSwipeLabel(null);
          }
        }}
        stackSize={3}
        backgroundColor={'#f0f0f0'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  searchButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  instructions: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500'
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center'
  },
  card: {
    borderRadius: 12,
    height: 450,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    backfaceVisibility: 'hidden'
  },
  cardBack: {
    backgroundColor: '#f8f9fa',
  },
  sitterImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  sitterEmoji: {
    fontSize: 48
  },
  sitterName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111827'
  },
  experience: {
    fontSize: 16,
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500'
  },
  sitterInfo: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8
  },
  contactInfo: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8
  },
  contactSection: {
    marginBottom: 16
  },
  infoSection: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4
  },
  sectionContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
  overlay: {
    position: 'absolute',
    top: 120,
    width: '100%',
    alignItems: 'center',
    zIndex: 10
  },
  interested: {
    fontSize: 36,
    fontWeight: 'bold',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: 12,
    borderRadius: 10
  },
  pass: {
    fontSize: 36,
    fontWeight: 'bold',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: 12,
    borderRadius: 10
  }
});