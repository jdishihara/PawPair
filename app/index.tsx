// app/index.tsx

import React, { useState } from 'react';
import { View } from 'react-native';
import AuthFlow from './AuthFlow';
import DogSitterSwipe from './DogSitterSwipe';

export default function Index() {
  const [isAuth, setIsAuth] = useState(false);

  if (!isAuth) {
    return <AuthFlow onAuthComplete={() => setIsAuth(true)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Once logged in, you can switch between screens as you like: */}
      <DogSitterSwipe />
    </View>
  );
}
