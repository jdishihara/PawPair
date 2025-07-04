// app/MapScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import { UserProfile } from './AuthFlow';
import { getCurrentUser, getAllUserProfiles, updateUserProfile } from '../utils/userStorage';
import { calculateDistance, getUsersNearLocation, updateUserLocation } from '../utils/locationStorage';

interface LocationUser extends UserProfile {
  distance?: number;
}

const { width, height } = Dimensions.get('window');

// Default region (San Francisco Bay Area)
const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<LocationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(10); // miles
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [showSearchRadius, setShowSearchRadius] = useState(false);

  useEffect(() => {
    loadLocationData();
  }, [searchRadius]);

  const loadLocationData = async () => {
    try {
      setLoading(true);
      let current = await getCurrentUser();
      console.log('🗺️ Current user loaded:', current);
      console.log('📍 User coordinates:', current?.latitude, current?.longitude);
      console.log('🏠 User address:', current?.address);
      
      // If user has address but no coordinates, try to geocode
      if (current && !current.latitude && !current.longitude && (current.address || current.zipCode)) {
        console.log('🔄 User has address but no coordinates, attempting geocoding...');
        try {
          const updatedUser = await updateUserLocation(current);
          if (updatedUser.latitude && updatedUser.longitude) {
            console.log('✅ Successfully geocoded user location, updating profile...');
            await updateUserProfile(updatedUser);
            current = updatedUser;
          }
        } catch (error) {
          console.error('❌ Failed to geocode current user:', error);
        }
      }
      
      setCurrentUser(current);

      if (current?.latitude && current?.longitude) {
        // Set region to user's location
        const userRegion: Region = {
          latitude: current.latitude,
          longitude: current.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(userRegion);

        // Get nearby users
        const nearby = await getUsersNearLocation(
          current.latitude,
          current.longitude,
          searchRadius
        );

        // Filter out current user and add distance calculations
        const usersWithDistance = nearby
          .filter(user => user.email !== current.email)
          .map(user => ({
            ...user,
            distance: user.latitude && user.longitude
              ? calculateDistance(
                  current.latitude!,
                  current.longitude!,
                  user.latitude,
                  user.longitude
                )
              : undefined
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        console.log('👥 Found nearby users:', usersWithDistance.length);
        setNearbyUsers(usersWithDistance);
      } else {
        // No user location, load ALL users with coordinates (no radius filtering)
        console.log('❌ Current user has no coordinates, loading all users...');
        const allUsers = await getAllUserProfiles();
        console.log('📊 Total users found:', allUsers.length);
        const usersWithCoordinates = allUsers.filter(user => 
          user.latitude && user.longitude
        );
        console.log('🗺️ Users with coordinates:', usersWithCoordinates.length);
        console.log('👥 Users with coordinates:', usersWithCoordinates.map(u => `${u.firstName} ${u.lastName} (${u.city || 'No city'})`));
        setNearbyUsers(usersWithCoordinates);
        
        // If we have users with coordinates, center the map to show them
        if (usersWithCoordinates.length > 0) {
          const latitudes = usersWithCoordinates.map(user => user.latitude!);
          const longitudes = usersWithCoordinates.map(user => user.longitude!);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLon = Math.min(...longitudes);
          const maxLon = Math.max(...longitudes);
          
          const centerLat = (minLat + maxLat) / 2;
          const centerLon = (minLon + maxLon) / 2;
          const deltaLat = Math.max(maxLat - minLat + 0.05, 0.1); // Add padding
          const deltaLon = Math.max(maxLon - minLon + 0.05, 0.1); // Add padding
          
          setRegion({
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: deltaLat,
            longitudeDelta: deltaLon,
          });
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      Alert.alert('Error', 'Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (currentUser?.latitude && currentUser?.longitude && mapRef.current) {
      const userRegion: Region = {
        latitude: currentUser.latitude,
        longitude: currentUser.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current.animateToRegion(userRegion, 1000);
    } else {
      Alert.alert('Location Not Set', 'Please set your address in your profile to use this feature.');
    }
  };

  const toggleSearchRadius = () => {
    setShowSearchRadius(!showSearchRadius);
  };

  const refreshAllUserLocations = async () => {
    console.log('🔄 Refreshing all user locations...');
    try {
      const allUsers = await getAllUserProfiles();
      let updatedCount = 0;
      
      for (const user of allUsers) {
        if (!user.latitude && !user.longitude && (user.address || user.zipCode)) {
          console.log(`🔄 Geocoding user: ${user.firstName} ${user.lastName}`);
          const updatedUser = await updateUserLocation(user);
          if (updatedUser.latitude && updatedUser.longitude) {
            await updateUserProfile(updatedUser);
            updatedCount++;
          }
        }
      }
      
      console.log(`✅ Updated ${updatedCount} user locations`);
      // Reload data after updating
      await loadLocationData();
    } catch (error) {
      console.error('❌ Error refreshing user locations:', error);
    }
  };

  const renderMarker = (user: LocationUser) => {
    if (!user.latitude || !user.longitude) return null;

    const isOwner = user.userType === 'owner';
    const markerColor = isOwner ? '#f59e0b' : '#10b981'; // Amber for owners, Emerald for sitters

    return (
      <Marker
        key={user.email}
        coordinate={{
          latitude: user.latitude,
          longitude: user.longitude
        }}
        pinColor={markerColor}
        title={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
        description={`${isOwner ? 'Dog Owner' : 'Dog Sitter'}${user.distance && !isNaN(user.distance) ? ` • ${user.distance.toFixed(1)} mi away` : ''}`}
      >
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>
              {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
            </Text>
            <Text style={styles.calloutText}>
              {isOwner ? '🐕 Dog Owner' : '❤️ Dog Sitter'}
            </Text>
            {isOwner && user.dogName && (
              <Text style={styles.calloutText}>
                🐕 {user.dogName || 'Pup'}
              </Text>
            )}
            {user.address && (
              <Text style={styles.calloutText}>
                📍 {user.address}
              </Text>
            )}
          </View>
        </Callout>
      </Marker>
    );
  };

  const renderCurrentUserMarker = () => {
    if (!currentUser?.latitude || !currentUser?.longitude) return null;

    return (
      <Marker
        coordinate={{
          latitude: currentUser.latitude,
          longitude: currentUser.longitude
        }}
        pinColor="#dc2626" // Red for current user
        title="Your Location"
        description={currentUser.address || "This is your current location"}
      />
    );
  };

  const renderSearchRadiusCircle = () => {
    if (!showSearchRadius || !currentUser?.latitude || !currentUser?.longitude) return null;

    // Convert miles to meters (1 mile = 1609.34 meters)
    const radiusInMeters = searchRadius * 1609.34;

    return (
      <Circle
        center={{
          latitude: currentUser.latitude,
          longitude: currentUser.longitude
        }}
        radius={radiusInMeters}
        strokeColor="rgba(37, 99, 235, 0.5)"
        fillColor="rgba(37, 99, 235, 0.1)"
        strokeWidth={2}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false} // We'll use our custom marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Render current user marker */}
        {renderCurrentUserMarker()}
        
        {/* Render search radius circle */}
        {renderSearchRadiusCircle()}
        
        {/* Render other user markers */}
        {nearbyUsers.map(renderMarker)}
      </MapView>

      {/* Floating controls */}
      <View style={styles.floatingControls}>
        {/* Search radius selector */}
        <View style={styles.radiusSelector}>
          <Text style={styles.radiusLabel}>Radius:</Text>
          <View style={styles.radiusButtons}>
            {[5, 10, 25, 50].map(radius => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  searchRadius === radius && styles.radiusButtonSelected
                ]}
                onPress={() => setSearchRadius(radius)}
              >
                <Text style={[
                  styles.radiusButtonText,
                  searchRadius === radius && styles.radiusButtonTextSelected
                ]}>
                  {radius}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={centerOnUser}
          >
            <MaterialIcons name="my-location" size={24} color="#2563eb" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, showSearchRadius && styles.actionButtonActive]}
            onPress={toggleSearchRadius}
          >
            <MaterialIcons name="radio-button-checked" size={24} color={showSearchRadius ? "#fff" : "#2563eb"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={refreshAllUserLocations}
          >
            <MaterialIcons name="refresh" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statsText}>
          {nearbyUsers.length} users {currentUser?.latitude && currentUser?.longitude ? `within ${searchRadius} miles` : 'with addresses'}
        </Text>
        {currentUser?.address ? (
          <Text style={styles.statsSubText}>
            📍 Your location: {currentUser.address}
          </Text>
        ) : (
          <Text style={styles.statsSubText}>
            ⚠️ No address set - add address in profile to see your location
          </Text>
        )}
        {!currentUser?.latitude && !currentUser?.longitude && currentUser?.address && (
          <Text style={styles.statsSubText}>
            🔄 Geocoding your address...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  map: {
    width: width,
    height: height,
  },
  floatingControls: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  radiusSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
  },
  radiusButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 6,
  },
  radiusButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600'
  },
  radiusButtonTextSelected: {
    color: '#fff'
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 12,
  },
  actionButtonActive: {
    backgroundColor: '#2563eb',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsSubText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center'
  },
  calloutContainer: {
    width: 180,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
});