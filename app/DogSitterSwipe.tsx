import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Swiper from 'react-native-deck-swiper';

export type SitterProfile = {
  id: number;
  name: string;
  experience: string;
  image: string;
  age: string;
  about: string;
};

const sitterProfiles: SitterProfile[] = [
  {
    id: 1,
    name: 'Alex ❤️',
    experience: '5 years with labs and retrievers',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    age: '28 years old',
    about: 'Loves long walks, fetch sessions, and giving treats! Great with large dogs.'
  },
  {
    id: 2,
    name: 'Jamie 🐾',
    experience: 'Worked at a dog daycare',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    age: '32 years old',
    about: 'Super active and love dogs of all sizes! Experienced with training and socialization.'
  },
  {
    id: 3,
    name: 'Taylor 🐕',
    experience: 'Vet assistant & lifelong dog lover',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
    age: '26 years old',
    about: 'Calm, responsible, and great with nervous pups. Medical background helps with special needs.'
  }
];

const FlipCard = ({ profile }: { profile: SitterProfile }) => {
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
    const nextValue = isFlipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue: nextValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start(() => setIsFlipped(!isFlipped));
  };

  return (
    <TouchableWithoutFeedback onPress={flip}>
      <View style={styles.card}>
        {/* Front side */}
        <Animated.View
          style={[styles.cardFace, { transform: [{ rotateY: frontRotateY }] }]}>
          <Image source={{ uri: profile.image }} style={styles.image} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.experience}>{profile.experience}</Text>
          <Text style={styles.hint}>Tap to see more</Text>
        </Animated.View>

        {/* Back side */}
        <Animated.View
          style={[styles.cardFace, styles.cardBack, { transform: [{ rotateY: backRotateY }] }]}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.experience}>{profile.age}</Text>
          <Text style={styles.about}>{profile.about}</Text>
          <Text style={styles.hint}>Tap to flip back</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function DogSitterSwipe() {
  const [swipeLabel, setSwipeLabel] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {swipeLabel && (
        <View style={styles.overlay}>
          <Text
            style={swipeLabel === 'PASS ❌' ? styles.pass : styles.interested}>
            {swipeLabel}
          </Text>
        </View>
      )}

      <Swiper
        cards={sitterProfiles}
        renderCard={(card: SitterProfile | null) => {
          if (!card) {
            return (
              <View style={[styles.card, styles.noMoreCard]}>
                <Text style={styles.noMoreText}>No more sitters 🐕</Text>
                <Text style={styles.noMoreSubtext}>
                  Check back later for more matches
                </Text>
              </View>
            );
          }
          return <FlipCard profile={card} />;
        }}
        onSwipedRight={(index: number) => {
          console.log('Interested in:', sitterProfiles[index]?.name);
          setSwipeLabel(null);
        }}
        onSwipedLeft={(index: number) => {
          console.log('Passed on:', sitterProfiles[index]?.name);
          setSwipeLabel(null);
        }}
        onSwiping={(x: number) => {
          if (x > 50) setSwipeLabel('INTERESTED ✅');
          else if (x < -50) setSwipeLabel('PASS ❌');
          else setSwipeLabel(null);
        }}
        stackSize={3}
        backgroundColor="transparent"
        animateOverlayLabelsOpacity
        animateCardOpacity
        disableBottomSwipe
        disableTopSwipe
        verticalSwipe={false}
        cardVerticalMargin={60}
        cardHorizontalMargin={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: '#f5f5f5'
  },
  card: {
    borderRadius: 12,
    height: 450,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
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
    backgroundColor: '#f8f8f8'
  },
  image: {
    width: Dimensions.get('window').width * 0.7,
    height: 280,
    borderRadius: 12,
    marginBottom: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333'
  },
  experience: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5
  },
  about: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
  },
  noMoreCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  noMoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 15
  },
  noMoreSubtext: {
    fontSize: 16,
    color: '#888',
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
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: 12,
    borderRadius: 10
  },
  pass: {
    fontSize: 36,
    fontWeight: 'bold',
    backgroundColor: '#f44336',
    color: '#fff',
    padding: 12,
    borderRadius: 10
  }
});


