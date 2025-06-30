// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';

import AuthFlow, { UserType } from './AuthFlow';
import DogSitterSwipe from './DogSitterSwipe';
import MatchSwipeScreen from './DogSwipe';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function IndexRoute() {
  const [userType, setUserType] = useState<UserType | null>(null);

  // Show AuthFlow until we know if this is an 'owner' or 'sitter'
  if (!userType) {
    return <AuthFlow onAuthComplete={type => setUserType(type)} />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialIcons>['name'];
          if (route.name === 'Home') {
            iconName = 'pets';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'circle';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={userType === 'owner' ? DogSitterSwipe : MatchSwipeScreen}
        options={{
          title: userType === 'owner' ? 'Find Sitters' : 'Find Dogs',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}
