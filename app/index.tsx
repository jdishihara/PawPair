// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import AuthFlow, { UserType } from './AuthFlow';
import CalendarScreen from './CalendarScreen';
import DogSitterSwipe from './DogSitterSwipe';
import MatchSwipeScreen from './DogSwipe';
import MatchesScreen from './MatchesScreen';
import MessagesScreen from './MessagesScreen';
import OwnerProfileScreen from './OwnerProfileScreen';
import SearchScreen from './SearchScreen';
import SitterProfileScreen from './SitterProfileScreen';

const Tab = createBottomTabNavigator();

export default function IndexRoute() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    setUserType(null);
  };

  // Load unread count when user is logged in
  useEffect(() => {
    if (!userType) return;

    const loadUnreadCount = async () => {
      try {
        const { getTotalUnreadCount } = await import('../utils/messageStorage');
        const count = await getTotalUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Set up polling for unread count
    const interval = setInterval(loadUnreadCount, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [userType]);

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
            case 'Matches':
              iconName = 'favorite';
              break;
            case 'Calendar':
              iconName = 'calendar-today';
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
          
          // Show badge for Messages tab if there are unread messages
          if (route.name === 'Messages' && unreadCount > 0) {
            return (
              <View style={{ position: 'relative' }}>
                <MaterialIcons name={iconName} size={size} color={color} />
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -3,
                  backgroundColor: '#dc2626',
                  borderRadius: 10,
                  width: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              </View>
            );
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
        name="Matches"
        component={MatchesScreen}
        options={{ title: 'Your Matches' }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
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
