// utils/locationStorage.ts
import { UserProfile } from '../app/AuthFlow';
import { getAllUserProfiles } from './userStorage';
import * as Location from 'expo-location';

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Geocoding function using expo-location with demo fallback
export async function geocodeAddress(address: string, city?: string, state?: string, zipCode?: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Build full address string for geocoding
    const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
    
    console.log(`🌐 Attempting real geocoding for: "${fullAddress}"`);
    
    // Try real geocoding first with expo-location
    if (fullAddress.trim()) {
      try {
        // Request location permissions first
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('📍 Location permission denied, falling back to demo coordinates');
        } else {
          // Use expo-location geocoding
          const geocodeResult = await Location.geocodeAsync(fullAddress);
          
          if (geocodeResult && geocodeResult.length > 0) {
            const { latitude, longitude } = geocodeResult[0];
            console.log(`✅ Real geocoding successful: ${latitude}, ${longitude}`);
            return { latitude, longitude };
          } else {
            console.log('❌ Real geocoding returned no results');
          }
        }
      } catch (geoError) {
        console.log('❌ Real geocoding failed:', geoError);
      }
    }
    
    // Fallback to demo coordinates
    console.log('🔄 Falling back to demo coordinates...');
    
    // Try ZIP code lookup first
    if (zipCode) {
      const demoCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
        // Major cities - common ZIP codes
        '10001': { latitude: 40.7505, longitude: -73.9934 }, // NYC Manhattan
        '10002': { latitude: 40.7156, longitude: -73.9877 }, // NYC Lower East Side
        '10003': { latitude: 40.7310, longitude: -73.9896 }, // NYC East Village
        '10010': { latitude: 40.7390, longitude: -73.9825 }, // NYC Chelsea
        '10011': { latitude: 40.7420, longitude: -73.9970 }, // NYC West Village
        '90210': { latitude: 34.0901, longitude: -118.4065 }, // Beverly Hills
        '90211': { latitude: 34.0840, longitude: -118.4067 }, // Beverly Hills
        '90024': { latitude: 34.0628, longitude: -118.4379 }, // Westwood
        '90025': { latitude: 34.0477, longitude: -118.4315 }, // West LA
        '60601': { latitude: 41.8825, longitude: -87.6441 }, // Chicago Loop
        '60602': { latitude: 41.8795, longitude: -87.6345 }, // Chicago Downtown
        '60603': { latitude: 41.8781, longitude: -87.6298 }, // Chicago South Loop
        '60610': { latitude: 41.8977, longitude: -87.6338 }, // Chicago Gold Coast
        '94102': { latitude: 37.7849, longitude: -122.4094 }, // San Francisco Civic Center
        '94103': { latitude: 37.7717, longitude: -122.4103 }, // San Francisco SOMA
        '94104': { latitude: 37.7920, longitude: -122.4013 }, // San Francisco Financial
        '94105': { latitude: 37.7875, longitude: -122.3905 }, // San Francisco Rincon Hill
        '94107': { latitude: 37.7617, longitude: -122.3951 }, // San Francisco Potrero Hill
        '94301': { latitude: 37.4419, longitude: -122.1430 }, // Palo Alto Downtown
        '94303': { latitude: 37.4274, longitude: -122.1522 }, // Palo Alto East
        '94306': { latitude: 37.4419, longitude: -122.1430 }, // Palo Alto (Bryant Street area)
        '94110': { latitude: 37.7481, longitude: -122.4147 }, // San Francisco Mission
        '94114': { latitude: 37.7596, longitude: -122.4341 }, // San Francisco Castro
        '94117': { latitude: 37.7706, longitude: -122.4469 }, // San Francisco Haight
        '94122': { latitude: 37.7594, longitude: -122.4862 }, // San Francisco Sunset
        '94124': { latitude: 37.7312, longitude: -122.3826 }, // San Francisco Bayview
        '94127': { latitude: 37.7365, longitude: -122.4581 }, // San Francisco West Portal
        '94002': { latitude: 37.5202, longitude: -122.2758 }, // Belmont
        '94010': { latitude: 37.5219, longitude: -122.3107 }, // Burlingame  
        '94025': { latitude: 37.4324, longitude: -122.1817 }, // Menlo Park
        '94040': { latitude: 37.3861, longitude: -122.0839 }, // Mountain View
        '94041': { latitude: 37.3688, longitude: -122.0363 }, // Mountain View East
        '94043': { latitude: 37.4188, longitude: -122.0544 }, // Mountain View West
        '94063': { latitude: 37.5383, longitude: -122.2947 }, // Redwood City
        '94085': { latitude: 37.4224, longitude: -122.0856 }, // Sunnyvale
        '94087': { latitude: 37.4071, longitude: -122.0538 }, // Sunnyvale South
        '94305': { latitude: 37.4275, longitude: -122.1697 }, // Stanford University
        '95014': { latitude: 37.3230, longitude: -122.0322 }, // Cupertino
        '95050': { latitude: 37.3541, longitude: -121.9552 }, // Santa Clara
        '95051': { latitude: 37.3688, longitude: -121.9678 }, // Santa Clara South
        '02101': { latitude: 42.3601, longitude: -71.0589 }, // Boston Downtown
        '02102': { latitude: 42.3505, longitude: -71.0387 }, // Boston Seaport
        '02103': { latitude: 42.3584, longitude: -71.0564 }, // Boston North End
        '02110': { latitude: 42.3647, longitude: -71.0547 }, // Boston Charlestown
        '33101': { latitude: 25.7617, longitude: -80.1918 }, // Miami Downtown
        '33102': { latitude: 25.7743, longitude: -80.1937 }, // Miami Beach
        '33109': { latitude: 25.8756, longitude: -80.1284 }, // Miami Beach North
        '33125': { latitude: 25.7584, longitude: -80.2373 }, // Miami Coral Gables
        '75201': { latitude: 32.7767, longitude: -96.7970 }, // Dallas Downtown
        '75202': { latitude: 32.7831, longitude: -96.8067 }, // Dallas West End
        '75204': { latitude: 32.7669, longitude: -96.7836 }, // Dallas Deep Ellum
        '75206': { latitude: 32.7886, longitude: -96.7589 }, // Dallas Lakewood
        '98101': { latitude: 47.6062, longitude: -122.3321 }, // Seattle Downtown
        '98102': { latitude: 47.6323, longitude: -122.3185 }, // Seattle Capitol Hill
        '98103': { latitude: 47.6687, longitude: -122.3412 }, // Seattle Fremont
        '98109': { latitude: 47.6205, longitude: -122.3493 }, // Seattle South Lake Union
        '30309': { latitude: 33.7490, longitude: -84.3880 }, // Atlanta Midtown
        '30310': { latitude: 33.7320, longitude: -84.4049 }, // Atlanta West End
        '30318': { latitude: 33.7901, longitude: -84.4161 }, // Atlanta Westside
        '80202': { latitude: 39.7392, longitude: -104.9903 }, // Denver Downtown
        '80203': { latitude: 39.7236, longitude: -104.9547 }, // Denver Capitol Hill
        '80204': { latitude: 39.7536, longitude: -105.0178 }, // Denver Highlands
        '19103': { latitude: 39.9526, longitude: -75.1652 }, // Philadelphia Center City
        '19102': { latitude: 39.9538, longitude: -75.1677 }, // Philadelphia Rittenhouse
        '19106': { latitude: 39.9523, longitude: -75.1498 }, // Philadelphia Old City
        '85001': { latitude: 33.4484, longitude: -112.0740 }, // Phoenix Downtown
        '85003': { latitude: 33.4734, longitude: -112.0879 }, // Phoenix Maryvale
        '85004': { latitude: 33.4373, longitude: -112.0677 }, // Phoenix South Mountain
        '97201': { latitude: 45.5152, longitude: -122.6784 }, // Portland Downtown
        '97202': { latitude: 45.4875, longitude: -122.6708 }, // Portland Southeast
        '97205': { latitude: 45.5266, longitude: -122.7017 }, // Portland Northwest
        '20001': { latitude: 38.9072, longitude: -77.0369 }, // Washington DC Downtown
        '20002': { latitude: 38.9007, longitude: -76.9951 }, // Washington DC Capitol Hill
        '20009': { latitude: 38.9245, longitude: -77.0434 }, // Washington DC Dupont Circle
        '89101': { latitude: 36.1699, longitude: -115.1398 }, // Las Vegas Downtown
        '89102': { latitude: 36.1447, longitude: -115.1563 }, // Las Vegas Arts District
        '89109': { latitude: 36.1147, longitude: -115.1728 }, // Las Vegas Strip
      };
      
      if (demoCoordinates[zipCode]) {
        console.log(`✅ Found ZIP code "${zipCode}" in demo coordinates`);
        return demoCoordinates[zipCode];
      } else {
        console.log(`❌ ZIP code "${zipCode}" not found in demo coordinates`);
      }
    }
    
    // Try city-based geocoding as fallback
    if (city) {
      const cityCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
        'new york': { latitude: 40.7128, longitude: -74.0060 },
        'nyc': { latitude: 40.7128, longitude: -74.0060 },
        'los angeles': { latitude: 34.0522, longitude: -118.2437 },
        'chicago': { latitude: 41.8781, longitude: -87.6298 },
        'houston': { latitude: 29.7604, longitude: -95.3698 },
        'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
        'phoenix': { latitude: 33.4484, longitude: -112.0740 },
        'san antonio': { latitude: 29.4241, longitude: -98.4936 },
        'san diego': { latitude: 32.7157, longitude: -117.1611 },
        'dallas': { latitude: 32.7767, longitude: -96.7970 },
        'san jose': { latitude: 37.3382, longitude: -121.8863 },
        'austin': { latitude: 30.2672, longitude: -97.7431 },
        'jacksonville': { latitude: 30.3322, longitude: -81.6557 },
        'san francisco': { latitude: 37.7749, longitude: -122.4194 },
        'palo alto': { latitude: 37.4419, longitude: -122.1430 },
        'mountain view': { latitude: 37.3861, longitude: -122.0839 },
        'sunnyvale': { latitude: 37.4224, longitude: -122.0856 },
        'cupertino': { latitude: 37.3230, longitude: -122.0322 },
        'santa clara': { latitude: 37.3541, longitude: -121.9552 },
        'redwood city': { latitude: 37.5383, longitude: -122.2947 },
        'menlo park': { latitude: 37.4324, longitude: -122.1817 },
        'burlingame': { latitude: 37.5219, longitude: -122.3107 },
        'belmont': { latitude: 37.5202, longitude: -122.2758 },
        'fremont': { latitude: 37.5485, longitude: -121.9886 },
        'hayward': { latitude: 37.6688, longitude: -122.0808 },
        'berkeley': { latitude: 37.8715, longitude: -122.2730 },
        'oakland': { latitude: 37.8044, longitude: -122.2711 },
        'columbus': { latitude: 39.9612, longitude: -82.9988 },
        'fort worth': { latitude: 32.7555, longitude: -97.3308 },
        'charlotte': { latitude: 35.2271, longitude: -80.8431 },
        'seattle': { latitude: 47.6062, longitude: -122.3321 },
        'denver': { latitude: 39.7392, longitude: -104.9903 },
        'boston': { latitude: 42.3601, longitude: -71.0589 },
        'nashville': { latitude: 36.1627, longitude: -86.7816 },
        'baltimore': { latitude: 39.2904, longitude: -76.6122 },
        'louisville': { latitude: 38.2527, longitude: -85.7585 },
        'portland': { latitude: 45.5152, longitude: -122.6784 },
        'oklahoma city': { latitude: 35.4676, longitude: -97.5164 },
        'milwaukee': { latitude: 43.0389, longitude: -87.9065 },
        'las vegas': { latitude: 36.1699, longitude: -115.1398 },
        'albuquerque': { latitude: 35.0844, longitude: -106.6504 },
        'tucson': { latitude: 32.2226, longitude: -110.9747 },
        'fresno': { latitude: 36.7378, longitude: -119.7871 },
        'sacramento': { latitude: 38.5816, longitude: -121.4944 },
        'mesa': { latitude: 33.4152, longitude: -111.8315 },
        'kansas city': { latitude: 39.0997, longitude: -94.5786 },
        'atlanta': { latitude: 33.7490, longitude: -84.3880 },
        'colorado springs': { latitude: 38.8339, longitude: -104.8214 },
        'raleigh': { latitude: 35.7796, longitude: -78.6382 },
        'omaha': { latitude: 41.2565, longitude: -95.9345 },
        'miami': { latitude: 25.7617, longitude: -80.1918 },
        'virginia beach': { latitude: 36.8529, longitude: -75.9780 },
        'minneapolis': { latitude: 44.9537, longitude: -93.2650 },
        'tulsa': { latitude: 36.1540, longitude: -95.9928 },
        'tampa': { latitude: 27.9506, longitude: -82.4572 },
        'arlington': { latitude: 32.7357, longitude: -97.1081 },
        'new orleans': { latitude: 29.9511, longitude: -90.0715 },
        'wichita': { latitude: 37.6872, longitude: -97.3301 },
        'cleveland': { latitude: 41.4993, longitude: -81.6944 },
        'washington': { latitude: 38.9072, longitude: -77.0369 },
        'dc': { latitude: 38.9072, longitude: -77.0369 },
        'pittsburgh': { latitude: 40.4406, longitude: -79.9959 },
        'cincinnati': { latitude: 39.1031, longitude: -84.5120 },
      };
      
      const cityKey = city.toLowerCase().trim();
      if (cityCoordinates[cityKey]) {
        console.log(`✅ Found city "${city}" in demo coordinates`);
        return cityCoordinates[cityKey];
      } else {
        console.log(`❌ City "${city}" not found in demo coordinates`);
      }
    }
    
    // If no coordinates found, return null
    console.log('❌ No coordinates found for this location');
    return null;
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Get users within a certain radius of a location
export async function getUsersNearLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 10
): Promise<UserProfile[]> {
  try {
    const allUsers = await getAllUserProfiles();
    
    return allUsers.filter(user => {
      if (!user.latitude || !user.longitude) {
        return false;
      }
      
      const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
      return distance <= radiusMiles;
    });
  } catch (error) {
    console.error('Error getting nearby users:', error);
    return [];
  }
}

// Update user location coordinates based on address
export async function updateUserLocation(userProfile: UserProfile): Promise<UserProfile> {
  try {
    console.log('🗺️ Geocoding user location...');
    console.log('📍 Address:', userProfile.address);
    console.log('🏙️ ZIP Code:', userProfile.zipCode);
    
    if (!userProfile.address && !userProfile.zipCode) {
      console.log('❌ No address or ZIP code provided');
      return userProfile;
    }
    
    const coordinates = await geocodeAddress(
      userProfile.address || '',
      userProfile.city,
      userProfile.state,
      userProfile.zipCode
    );
    
    console.log('📍 Geocoded coordinates:', coordinates);
    
    if (coordinates) {
      const updatedProfile = {
        ...userProfile,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };
      console.log('✅ User location updated with coordinates');
      return updatedProfile;
    }
    
    console.log('❌ Geocoding failed, returning original profile');
    return userProfile;
  } catch (error) {
    console.error('Error updating user location:', error);
    return userProfile;
  }
}