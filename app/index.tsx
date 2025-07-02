// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';

import AuthFlow, { UserType } from './AuthFlow';
import DogSitterSwipe from './DogSitterSwipe';
import MatchSwipeScreen from './DogSwipe';
import MessagesScreen from './MessagesScreen';
import OwnerProfileScreen from './OwnerProfileScreen';
import SearchScreen from './SearchScreen';
import SitterProfileScreen from './SitterProfileScreen';

const Tab = createBottomTabNavigator();

export default function IndexRoute() {
  const [userType, setUserType] = useState<UserType | null>(null);

  const handleLogout = () => {
    setUserType(null);
  };

  // Before login: render AuthFlow
  if (!userType) {
    return <AuthFlow onAuthComplete={type => setUserType(type)} />;
  }

  // After login: Bottom Tab Navigator
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialIcons>['name'];
          switch (route.name) {
            case 'Home':
              iconName = 'pets';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Messages':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={userType === 'owner' ? DogSitterSwipe : MatchSwipeScreen}
        options={{ title: userType === 'owner' ? 'Find Sitters' : 'Find Dogs' }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search Users' }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />

      <Tab.Screen
        name="Profile"
        options={{ title: 'My Profile' }}
      >
        {() =>
          userType === 'owner'
            ? <OwnerProfileScreen onLogout={handleLogout} />
            : <SitterProfileScreen onLogout={handleLogout} />
        }
      </Tab.Screen>
    </Tab.Navigator>
  );
}
