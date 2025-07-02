import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { UserProfile } from './AuthFlow';
import { getUsersByType } from '../utils/userStorage';
import { getSwipedUsers, saveSwipeDecision } from '../utils/matchStorage';

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
        {/* Front of card - Dog Info */}
        <Animated.View 
          style={[
            styles.cardFace, 
            { transform: [{ rotateY: frontRotateY }] }
          ]}
        >
          <View style={styles.dogImagePlaceholder}>
            <Text style={styles.dogEmoji}>🐕</Text>
          </View>
          <Text style={styles.dogName}>{profile.dogName || 'Furry Friend'}</Text>
          <Text style={styles.dogBreed}>{profile.dogBreed || 'Mixed Breed'}</Text>
          {profile.dogAge && (
            <Text style={styles.dogInfo}>{profile.dogAge}</Text>
          )}
          {profile.dogSize && (
            <Text style={styles.dogInfo}>Size: {profile.dogSize.replace('_', ' ')}</Text>
          )}
          <Text style={styles.hint}>Tap to see owner details</Text>
        </Animated.View>

        {/* Back of card - Owner Info */}
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardBack, 
            { transform: [{ rotateY: backRotateY }] }
          ]}
        >
          <Text style={styles.ownerName}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.contactInfo}>📞 {profile.phone}</Text>
          {profile.emergencyContact && (
            <Text style={styles.contactInfo}>🚨 Emergency: {profile.emergencyContact}</Text>
          )}
          
          {profile.dogTemperament && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Temperament</Text>
              <Text style={styles.sectionContent}>{profile.dogTemperament}</Text>
            </View>
          )}
          
          {profile.dogExerciseNeeds && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Exercise Needs</Text>
              <Text style={styles.sectionContent}>{profile.dogExerciseNeeds}</Text>
            </View>
          )}
          
          {profile.dogAllergies && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <Text style={styles.sectionContent}>{profile.dogAllergies}</Text>
            </View>
          )}
          
          <Text style={styles.hint}>Tap to flip back</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function MatchSwipeScreen() {
  const [dogOwners, setDogOwners] = useState<UserProfile[]>([]);
  const [swipeLabel, setSwipeLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDogOwners();
  }, []);

  const loadDogOwners = async () => {
    try {
      const owners = await getUsersByType('owner');
      // Filter owners who have dog information
      const ownersWithDogs = owners.filter(owner => owner.dogName && owner.dogBreed);
      
      // Filter out users already swiped on
      const swipedUserEmails = await getSwipedUsers();
      const unswipedOwners = ownersWithDogs.filter(owner => 
        !swipedUserEmails.includes(owner.email)
      );
      
      setDogOwners(unswipedOwners);
    } catch (error) {
      console.error('Error loading dog owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (index: number) => {
    const owner = dogOwners[index];
    if (owner) {
      console.log('Interested in caring for:', owner.dogName, 'owned by', owner.firstName);
      
      const success = await saveSwipeDecision(owner.email, 'interested');
      if (success) {
        console.log('✅ Swipe decision saved');
      } else {
        Alert.alert('Error', 'Failed to save your interest. Please try again.');
      }
    }
    setSwipeLabel(null);
  };

  const handleSwipeLeft = async (index: number) => {
    const owner = dogOwners[index];
    if (owner) {
      console.log('Passed on:', owner.dogName);
      
      const success = await saveSwipeDecision(owner.email, 'pass');
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
        <Text style={styles.loadingText}>Loading dogs to care for...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {swipeLabel && (
        <View style={styles.overlay}>
          <Text style={swipeLabel === 'PASS ❌' ? styles.pass : styles.interested}>
            {swipeLabel}
          </Text>
        </View>
      )}
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Swipe right if you&apos;d like to care for this dog!</Text>
      </View>
      
      <Swiper
        cards={dogOwners}
        renderCard={(owner: UserProfile | undefined) => {
          if (!owner) {
            return (
              <View style={[styles.card, styles.centered]}>
                <Text style={styles.emptyTitle}>No more dogs! 🐕</Text>
                <Text style={styles.emptySubtitle}>Check back later for new opportunities</Text>
              </View>
            );
          }

          return <FlipCard profile={owner} />;
        }}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwiping={(x: number) => {
          if (x > 50) {
            setSwipeLabel('INTERESTED 🐾');
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
    paddingTop: 80,
    backgroundColor: '#fff'
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
  dogImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  dogEmoji: {
    fontSize: 48
  },
  dogName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827'
  },
  dogBreed: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8
  },
  dogInfo: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4
  },
  ownerName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827'
  },
  contactInfo: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8
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
    backgroundColor: '#dcfce7',
    color: '#16a34a',
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