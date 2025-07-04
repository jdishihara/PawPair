// app/EditProfileScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { UserProfile } from './AuthFlow';
import { updateUserProfile } from '../utils/userStorage';

interface EditProfileScreenProps {
  userProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export default function EditProfileScreen({ userProfile, onSave, onCancel }: EditProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>({ ...userProfile });
  const [loading, setLoading] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.phone) {
      Alert.alert('Error', 'Please fill in all required fields (name and phone)');
      return;
    }
    
    // Additional validation for dog owners
    if (profile.userType === 'owner') {
      if (!profile.dogName || !profile.dogBreed) {
        Alert.alert('Error', 'Please fill in your dog\'s name and breed');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const success = await updateUserProfile(profile);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => onSave(profile) }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    placeholder: string,
    key: keyof UserProfile,
    keyboardType: any = 'default',
    multiline: boolean = false
  ) => (
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      placeholder={placeholder}
      value={profile[key]?.toString() || ''}
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={text => updateProfile(key, text)}
    />
  );

  const isOwner = profile.userType === 'owner';
  const isSitter = profile.userType === 'sitter';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <Text style={styles.sectionHeader}>Personal Information</Text>
      {renderInput('First Name *', 'firstName')}
      {renderInput('Last Name *', 'lastName')}
      {renderInput('Phone Number *', 'phone', 'phone-pad')}
      {renderInput('Emergency Contact', 'emergencyContact')}
      
      {isOwner && (
        <>
          <Text style={styles.sectionHeader}>Dog Information</Text>
          {renderInput('Dog Name *', 'dogName')}
          {renderInput('Dog Breed *', 'dogBreed')}
          {renderInput('Dog Age (e.g., 3 years)', 'dogAge')}
          {renderInput('Dog Weight (e.g., 45 lbs)', 'dogWeight')}
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Dog Size</Text>
            <View style={styles.pickerButtons}>
              {['small', 'medium', 'large', 'extra_large'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.pickerButton,
                    profile.dogSize === size && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('dogSize', size)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.dogSize === size && styles.pickerButtonTextSelected
                  ]}>
                    {size.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {renderInput('Allergies/Sensitivities', 'dogAllergies', 'default', true)}
          {renderInput('Exercise Needs', 'dogExerciseNeeds', 'default', true)}
          {renderInput('Temperament', 'dogTemperament', 'default', true)}
          {renderInput('Health Issues (if any)', 'dogHealthIssues', 'default', true)}
          {renderInput('Training Level', 'dogTrainingLevel')}
          {renderInput('Vaccination Status', 'dogVaccinations')}
          {renderInput('Diet/Food Preferences', 'dogDiet', 'default', true)}
        </>
      )}
      
      {isSitter && (
        <>
          <Text style={styles.sectionHeader}>Sitter Information</Text>
          {renderInput('Experience with dogs', 'experience', 'default', true)}
          {renderInput('Max Distance (miles)', 'maxDistance', 'numeric')}
        </>
      )}
      
      <Text style={styles.sectionHeader}>Home Information</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Home Type</Text>
        <View style={styles.pickerButtons}>
          {['apartment', 'house', 'house_with_yard'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pickerButton,
                profile.homeType === type && styles.pickerButtonSelected
              ]}
              onPress={() => updateProfile('homeType', type)}
            >
              <Text style={[
                styles.pickerButtonText,
                profile.homeType === type && styles.pickerButtonTextSelected
              ]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Has Other Pets?</Text>
        <View style={styles.pickerButtons}>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              profile.hasOtherPets === true && styles.pickerButtonSelected
            ]}
            onPress={() => updateProfile('hasOtherPets', true)}
          >
            <Text style={[
              styles.pickerButtonText,
              profile.hasOtherPets === true && styles.pickerButtonTextSelected
            ]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              profile.hasOtherPets === false && styles.pickerButtonSelected
            ]}
            onPress={() => updateProfile('hasOtherPets', false)}
          >
            <Text style={[
              styles.pickerButtonText,
              profile.hasOtherPets === false && styles.pickerButtonTextSelected
            ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service preferences for owners */}
      {profile.userType === 'owner' && (
        <>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Services Needed</Text>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Dog Sitting</Text>
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.needsSitting === true && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('needsSitting', true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.needsSitting === true && styles.pickerButtonTextSelected
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.needsSitting === false && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('needsSitting', false)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.needsSitting === false && styles.pickerButtonTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Dog Walking</Text>
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.needsWalking === true && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('needsWalking', true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.needsWalking === true && styles.pickerButtonTextSelected
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.needsWalking === false && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('needsWalking', false)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.needsWalking === false && styles.pickerButtonTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {profile.needsWalking && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Walking Duration</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.walkingDuration || ''}
                    onChangeText={(value) => updateProfile('walkingDuration', value)}
                    placeholder="30 minutes, 1 hour, etc."
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Walking Frequency</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.walkingFrequency || ''}
                    onChangeText={(value) => updateProfile('walkingFrequency', value)}
                    placeholder="Daily, twice a day, weekly, etc."
                  />
                </View>
              </>
            )}
          </View>
        </>
      )}

      {/* Service preferences for sitters */}
      {profile.userType === 'sitter' && (
        <>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Dog Sitting</Text>
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.providesSitting === true && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('providesSitting', true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.providesSitting === true && styles.pickerButtonTextSelected
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.providesSitting === false && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('providesSitting', false)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.providesSitting === false && styles.pickerButtonTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Dog Walking</Text>
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.providesWalking === true && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('providesWalking', true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.providesWalking === true && styles.pickerButtonTextSelected
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    profile.providesWalking === false && styles.pickerButtonSelected
                  ]}
                  onPress={() => updateProfile('providesWalking', false)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    profile.providesWalking === false && styles.pickerButtonTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {profile.providesWalking && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Walking Duration Offered</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.walkingDuration || ''}
                    onChangeText={(value) => updateProfile('walkingDuration', value)}
                    placeholder="30-60 minutes, flexible, etc."
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Walking Frequency Available</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.walkingFrequency || ''}
                    onChangeText={(value) => updateProfile('walkingFrequency', value)}
                    placeholder="Daily, multiple times daily, weekends, etc."
                  />
                </View>
              </>
            )}
          </View>
        </>
      )}
      
      <Text style={styles.sectionHeader}>Location Information</Text>
      {renderInput('Address', 'address')}
      {renderInput('City', 'city')}
      {renderInput('State/Province', 'state')}
      {renderInput('ZIP/Postal Code', 'zipCode')}
      
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#111827'
  },
  placeholder: {
    width: 60
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#2563eb',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9fafb'
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151'
  },
  pickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  pickerButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: '30%',
    marginBottom: 8,
    alignItems: 'center'
  },
  pickerButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize'
  },
  pickerButtonTextSelected: {
    color: '#fff',
    fontWeight: '500'
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center'
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  bottomSpacer: {
    height: 40
  },
  sectionContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2563eb',
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151'
  }
});