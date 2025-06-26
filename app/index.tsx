// app/index.tsx
import React, { useState } from 'react';
import { View } from 'react-native';

import AuthFlow, { UserType } from './AuthFlow';
import DogSitterSwipe from './DogSitterSwipe';
import MatchSwipeScreen from './MatchSwipeScreen';

export default function IndexRoute() {
  const [userType, setUserType] = useState<UserType | null>(null);

  if (!userType) {
    return <AuthFlow onAuthComplete={(type) => setUserType(type)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {userType === 'owner'
        ? <DogSitterSwipe />
        : <MatchSwipeScreen />
      }
    </View>
  );
}
