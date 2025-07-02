// app/OwnerProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearCurrentUser, getCurrentUser } from '../utils/userStorage';
import { UserProfile } from './AuthFlow';

interface OwnerProfileScreenProps {
  onLogout?: () => void;
}

export default function OwnerProfileScreen({ onLogout }: OwnerProfileScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearCurrentUser();
            onLogout?.();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>Error loading profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Owner Profile</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.info}>Name: {userProfile.firstName} {userProfile.lastName}</Text>
        <Text style={styles.info}>Email: {userProfile.email}</Text>
        <Text style={styles.info}>Phone: {userProfile.phone}</Text>
        {userProfile.emergencyContact && (
          <Text style={styles.info}>Emergency Contact: {userProfile.emergencyContact}</Text>
        )}
      </View>

      {userProfile.homeType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Information</Text>
          <Text style={styles.info}>Home Type: {userProfile.homeType.replace(/_/g, ' ')}</Text>
          {userProfile.hasOtherPets !== undefined && (
            <Text style={styles.info}>Has Other Pets: {userProfile.hasOtherPets ? 'Yes' : 'No'}</Text>
          )}
        </View>
      )}

      {userProfile.dogName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dog Information</Text>
          <Text style={styles.info}>Dog Name: {userProfile.dogName}</Text>
          {userProfile.dogBreed && (
            <Text style={styles.info}>Breed: {userProfile.dogBreed}</Text>
          )}
          {userProfile.dogAge && (
            <Text style={styles.info}>Age: {userProfile.dogAge}</Text>
          )}
          {userProfile.dogWeight && (
            <Text style={styles.info}>Weight: {userProfile.dogWeight}</Text>
          )}
          {userProfile.dogSize && (
            <Text style={styles.info}>Size: {userProfile.dogSize.replace('_', ' ')}</Text>
          )}
          {userProfile.dogTemperament && (
            <Text style={styles.info}>Temperament: {userProfile.dogTemperament}</Text>
          )}
        </View>
      )}

      {(userProfile.dogAllergies || userProfile.dogHealthIssues || userProfile.dogVaccinations) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Care</Text>
          {userProfile.dogAllergies && (
            <Text style={styles.info}>Allergies: {userProfile.dogAllergies}</Text>
          )}
          {userProfile.dogHealthIssues && (
            <Text style={styles.info}>Health Issues: {userProfile.dogHealthIssues}</Text>
          )}
          {userProfile.dogVaccinations && (
            <Text style={styles.info}>Vaccinations: {userProfile.dogVaccinations}</Text>
          )}
        </View>
      )}

      {(userProfile.dogExerciseNeeds || userProfile.dogTrainingLevel || userProfile.dogDiet) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Requirements</Text>
          {userProfile.dogExerciseNeeds && (
            <Text style={styles.info}>Exercise Needs: {userProfile.dogExerciseNeeds}</Text>
          )}
          {userProfile.dogTrainingLevel && (
            <Text style={styles.info}>Training Level: {userProfile.dogTrainingLevel}</Text>
          )}
          {userProfile.dogDiet && (
            <Text style={styles.info}>Diet: {userProfile.dogDiet}</Text>
          )}
        </View>
      )}

      {userProfile.preferredSizes && userProfile.preferredSizes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.info}>Preferred Dog Sizes: {userProfile.preferredSizes.join(', ')}</Text>
          {userProfile.maxDistance && (
            <Text style={styles.info}>Max Distance: {userProfile.maxDistance} miles</Text>
          )}
        </View>
      )}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    padding: 20 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 24,
    textAlign: 'center'
  },
  section: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2563eb'
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151'
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});