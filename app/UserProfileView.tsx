// app/UserProfileView.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserProfile } from './AuthFlow';

interface UserProfileViewProps {
  userProfile: UserProfile;
  onBack: () => void;
  onMessage?: () => void;
}

export default function UserProfileView({ userProfile, onBack, onMessage }: UserProfileViewProps) {
  const isOwner = userProfile.userType === 'owner';
  const isSitter = userProfile.userType === 'sitter';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwner ? 'Dog Owner Profile' : 'Dog Sitter Profile'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.info}>Name: {userProfile.firstName} {userProfile.lastName}</Text>
        <Text style={styles.info}>Email: {userProfile.email}</Text>
        <Text style={styles.info}>Phone: {userProfile.phone}</Text>
        {userProfile.emergencyContact && (
          <Text style={styles.info}>Emergency Contact: {userProfile.emergencyContact}</Text>
        )}
      </View>

      {isOwner && userProfile.dogName && (
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

      {isOwner && (userProfile.dogAllergies || userProfile.dogHealthIssues || userProfile.dogVaccinations) && (
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

      {isOwner && (userProfile.dogExerciseNeeds || userProfile.dogTrainingLevel || userProfile.dogDiet) && (
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

      {isSitter && userProfile.experience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.info}>Experience with dogs: {userProfile.experience}</Text>
        </View>
      )}

      {isSitter && userProfile.maxDistance && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Area</Text>
          <Text style={styles.info}>Maximum distance: {userProfile.maxDistance} miles</Text>
        </View>
      )}

      {userProfile.homeType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Information</Text>
          <Text style={styles.info}>Home Type: {userProfile.homeType.replace(/_/g, ' ')}</Text>
          {userProfile.hasOtherPets !== undefined && (
            <Text style={styles.info}>Has Other Pets: {userProfile.hasOtherPets ? 'Yes' : 'No'}</Text>
          )}
        </View>
      )}

      {/* Services Section for Owners */}
      {isOwner && (userProfile.needsSitting || userProfile.needsWalking) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Needed</Text>
          {userProfile.needsSitting && (
            <Text style={styles.info}>🏠 Needs dog sitting services</Text>
          )}
          {userProfile.needsWalking && (
            <Text style={styles.info}>🚶 Needs dog walking services</Text>
          )}
          {userProfile.needsWalking && userProfile.walkingDuration && (
            <Text style={styles.info}>Walking Duration: {userProfile.walkingDuration}</Text>
          )}
          {userProfile.needsWalking && userProfile.walkingFrequency && (
            <Text style={styles.info}>Walking Frequency: {userProfile.walkingFrequency}</Text>
          )}
        </View>
      )}

      {/* Services Section for Sitters */}
      {isSitter && (userProfile.providesSitting || userProfile.providesWalking) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          {userProfile.providesSitting && (
            <Text style={styles.info}>🏠 Provides dog sitting services</Text>
          )}
          {userProfile.providesWalking && (
            <Text style={styles.info}>🚶 Provides dog walking services</Text>
          )}
          {userProfile.providesWalking && userProfile.walkingDuration && (
            <Text style={styles.info}>Walking Duration: {userProfile.walkingDuration}</Text>
          )}
          {userProfile.providesWalking && userProfile.walkingFrequency && (
            <Text style={styles.info}>Walking Frequency: {userProfile.walkingFrequency}</Text>
          )}
        </View>
      )}

      {isSitter && (userProfile.preferredStartTime || userProfile.shortNotice || userProfile.overnightCare || userProfile.weekendCare || userProfile.holidayCare) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability & Care Options</Text>
          {userProfile.preferredStartTime && userProfile.preferredEndTime && (
            <Text style={styles.info}>
              Preferred Hours: {userProfile.preferredStartTime} - {userProfile.preferredEndTime}
            </Text>
          )}
          {userProfile.shortNotice && (
            <Text style={styles.info}>✅ Available for short notice requests</Text>
          )}
          {userProfile.overnightCare && (
            <Text style={styles.info}>✅ Provides overnight care</Text>
          )}
          {userProfile.weekendCare && (
            <Text style={styles.info}>✅ Available on weekends</Text>
          )}
          {userProfile.holidayCare && (
            <Text style={styles.info}>✅ Available on holidays</Text>
          )}
        </View>
      )}

      {onMessage && (
        <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#fff',
    padding: 20 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    marginRight: 16
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
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
    color: '#374151',
    lineHeight: 22
  },
  messageButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center'
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});