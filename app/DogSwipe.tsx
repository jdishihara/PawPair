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

type DogProfile = {
  id: number;
  name: string;
  breed: string;
  image: string;
  age?: string;
  about?: string;
};

const sampleProfiles: DogProfile[] = [
  {
    id: 1,
    name: 'Charlie 🐶',
    breed: 'Golden Retriever',
    image: 'https://placedog.net/500/400?id=1',
    age: '3 years old',
    about: 'Loves hiking, belly rubs, and tennis balls.'
  },
  {
    id: 2,
    name: 'Luna 🐕',
    breed: 'Husky Mix',
    image: 'https://placedog.net/500/400?id=2',
    age: '2 years old',
    about: 'Super energetic and friendly. Will talk to you.'
  },
  {
    id: 3,
    name: 'Max 🐾',
    breed: 'Corgi',
    image: 'https://placedog.net/500/400?id=3',
    age: '1 year old',
    about: 'Low to the ground, high on charm.'
  }
];

const FlipCard = ({ profile }: { profile: DogProfile }) => {
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
        {/* Front of card */}
        <Animated.View 
          style={[
            styles.cardFace, 
            { transform: [{ rotateY: frontRotateY }] }
          ]}
        >
          <Image source={{ uri: profile.image }} style={styles.image} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.breed}>{profile.breed}</Text>
          <Text style={styles.hint}>Tap card to see more</Text>
        </Animated.View>

        {/* Back of card */}
        <Animated.View 
          style={[
            styles.cardFace, 
            styles.cardBack, 
            { transform: [{ rotateY: backRotateY }] }
          ]}
        >
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.breed}>{profile.age}</Text>
          <Text style={styles.about}>{profile.about}</Text>
          <Text style={styles.hint}>Tap card to flip back</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function MatchSwipeScreen() {
  const [swipeLabel, setSwipeLabel] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {swipeLabel && (
        <View style={styles.overlay}>
          <Text style={swipeLabel === 'PASS ❌' ? styles.pass : styles.interested}>
            {swipeLabel}
          </Text>
        </View>
      )}
      <Swiper
        cards={sampleProfiles}
        renderCard={(card: DogProfile | undefined) => {
          if (!card) {
            return (
              <View style={styles.card}>
                <Text style={styles.name}>No more pups 🐕</Text>
              </View>
            );
          }

          return <FlipCard profile={card} />;
        }}
        onSwipedRight={(index: number) => {
          console.log('Swiped Right:', sampleProfiles[index]?.name);
          setSwipeLabel(null);
        }}
        onSwipedLeft={(index: number) => {
          console.log('Swiped Left:', sampleProfiles[index]?.name);
          setSwipeLabel(null);
        }}
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
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: Dimensions.get('window').width * 0.8,
    height: 300,
    borderRadius: 12,
    marginBottom: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
  breed: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center'
  },
  about: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
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
    backgroundColor: '#ccffcc',
    color: '#006600',
    padding: 12,
    borderRadius: 10
  },
  pass: {
    fontSize: 36,
    fontWeight: 'bold',
    backgroundColor: '#ffcccc',
    color: '#990000',
    padding: 12,
    borderRadius: 10
  }
});