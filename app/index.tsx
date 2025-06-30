// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';

import AuthFlow, { UserType } from './AuthFlow';
import DogSitterSwipe from './DogSitterSwipe';
import MatchSwipeScreen from './DogSwipe';
import OwnerProfileScreen from './OwnerProfileScreen';
import SitterProfileScreen from './SitterProfileScreen';

const Tab = createBottomTabNavigator();

export default function IndexRoute() {
  const [userType, setUserType] = useState<UserType | null>(null);

  // 1) Before login: show your existing AuthFlow
  if (!userType) {
    return <AuthFlow onAuthComplete={type => setUserType(type)} />;
  }

  // 2) After login: show Home + Profile tabs
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialIcons>['name'] =
            route.name === 'Home'    ? 'pets'
          : route.name === 'Profile' ? 'person'
          : 'circle';

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Home uses different swipe screens per userType */}
      <Tab.Screen
        name="Home"
        component={userType === 'owner' ? DogSitterSwipe : MatchSwipeScreen}
        options={{
          title: userType === 'owner' ? 'Find Sitters' : 'Find Dogs'
        }}
      />

      {/* Profile renders a different component depending on userType */}
      <Tab.Screen
        name="Profile"
        options={{ title: 'My Profile' }}
      >
        {() =>
          userType === 'owner'
            ? <OwnerProfileScreen />
            : <SitterProfileScreen />
        }
      </Tab.Screen>
    </Tab.Navigator>
  );
}
