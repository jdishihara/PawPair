import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { isEmailRegistered, saveUserProfile, setCurrentUser, validateLogin } from '../utils/userStorage';
import { updateUserLocation } from '../utils/locationStorage';

// Props now include userType callback
type AuthFlowProps = {
  onAuthComplete: (userType: 'owner' | 'sitter') => void;
};

// Types
export type UserType = 'owner' | 'sitter';
export type AuthStep =
  | 'login'
  | 'signup'
  | 'userType'
  | 'ownerProfile'
  | 'sitterProfile'
  | 'careKarmaProfile'
  | 'complete';

export type UserProfile = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: UserType;
  profilePhoto?: string; // Base64 encoded image or file URI
  emergencyContact?: string;
  experience?: string;
  homeType?: 'apartment' | 'house' | 'house_with_yard';
  hasOtherPets?: boolean;
  maxDistance?: number;
  preferredSizes?: string[];
  // Care Karma fields
  isCareKarma?: boolean; // Flag for high school students earning service hours
  serviceHours?: number; // Total community service hours earned
  schoolName?: string; // High school name
  graduationYear?: string; // Expected graduation year
  // Dog information for owners
  dogName?: string;
  dogBreed?: string;
  dogAge?: string;
  dogWeight?: string;
  dogSize?: 'small' | 'medium' | 'large' | 'extra_large';
  dogAllergies?: string;
  dogExerciseNeeds?: string;
  dogTemperament?: string;
  dogHealthIssues?: string;
  dogTrainingLevel?: string;
  dogVaccinations?: string;
  dogDiet?: string;
  // Availability preferences
  preferredStartTime?: string; // Default start time for availability
  preferredEndTime?: string; // Default end time for availability
  availableDays?: string[]; // Days of week available ['monday', 'tuesday', etc.]
  shortNotice?: boolean; // Available for short notice requests
  overnightCare?: boolean; // Available for overnight care
  weekendCare?: boolean; // Available for weekend care
  holidayCare?: boolean; // Available for holiday care
  // Service preferences
  needsSitting?: boolean; // Owner: needs dog sitting service
  needsWalking?: boolean; // Owner: needs dog walking service
  providesSitting?: boolean; // Sitter: provides sitting service
  providesWalking?: boolean; // Sitter: provides walking service
  walkingDuration?: string; // Preferred walking duration (30min, 1hr, etc.)
  walkingFrequency?: string; // How often walks are needed/provided
  // Location information
  address?: string; // Full address input by user
  city?: string; // City
  state?: string; // State/Province
  zipCode?: string; // Postal/ZIP code
  latitude?: number; // Geocoded latitude
  longitude?: number; // Geocoded longitude
};

const AuthFlow = ({ onAuthComplete }: AuthFlowProps) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: true, // Get base64 for storage
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = result.assets[0].base64;
        
        // Store as data URI for consistent handling
        const dataUri = `data:image/jpeg;base64,${base64}`;
        updateProfile('profilePhoto', dataUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleAuth = async () => {
    if (!profile.email || !profile.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Validate login credentials
        const userProfile = await validateLogin(profile.email, profile.password);
        if (userProfile) {
          setProfile(userProfile);
          await setCurrentUser(userProfile);
          setCurrentStep('complete');
        } else {
          Alert.alert('Login Failed', 'Invalid email or password');
        }
      } else {
        // Check if email is already registered for signup
        const emailExists = await isEmailRegistered(profile.email);
        if (emailExists) {
          Alert.alert('Signup Failed', 'This email is already registered. Please use a different email or try logging in.');
        } else {
          setCurrentStep('userType');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeSelection = (type: UserType, isCareKarma: boolean = false) => {
    updateProfile('userType', type);
    if (isCareKarma) {
      updateProfile('isCareKarma', true);
      updateProfile('serviceHours', 0);
      setCurrentStep('careKarmaProfile');
    } else {
      setCurrentStep(type === 'owner' ? 'ownerProfile' : 'sitterProfile');
    }
  };

  const handleProfileSubmit = async () => {
    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Additional validation for dog owners
    if (profile.userType === 'owner') {
      if (!profile.dogName || !profile.dogBreed || !profile.dogAge || !profile.dogWeight) {
        Alert.alert('Error', 'Please fill in your dog\'s basic information (name, breed, age, weight)');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      console.log('🚀 Starting profile submission...');
      console.log('📝 Profile data:', {
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode
      });
      
      // Geocode the user's address to get coordinates
      let profileWithLocation = profile as UserProfile;
      if (profile.address || profile.zipCode) {
        console.log('📍 Geocoding address...');
        profileWithLocation = await updateUserLocation(profile as UserProfile);
        console.log('📍 After geocoding:', {
          latitude: profileWithLocation.latitude,
          longitude: profileWithLocation.longitude
        });
      } else {
        console.log('❌ No address or ZIP code to geocode');
      }
      
      const success = await saveUserProfile(profileWithLocation);
      if (success) {
        await setCurrentUser(profileWithLocation);
        setCurrentStep('complete');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    placeholder: string,
    key: keyof UserProfile,
    keyboardType: any = 'default'
  ) => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={profile[key]?.toString() || ''}
      keyboardType={keyboardType}
      onChangeText={text => updateProfile(key, text)}
    />
  );

  const renderPasswordInput = (
    placeholder: string,
    key: keyof UserProfile
  ) => (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        placeholder={placeholder}
        value={profile[key]?.toString() || ''}
        secureTextEntry={!showPassword}
        onChangeText={text => updateProfile(key, text)}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <MaterialIcons
          name={showPassword ? 'visibility' : 'visibility-off'}
          size={24}
          color="#6b7280"
        />
      </TouchableOpacity>
    </View>
  );

  const renderPhotoUpload = () => (
    <View style={styles.photoUploadContainer}>
      <Text style={styles.photoLabel}>Profile Photo</Text>
      <TouchableOpacity style={styles.photoUploadButton} onPress={pickImage}>
        {profile.profilePhoto ? (
          <Image source={{ uri: profile.profilePhoto }} style={styles.profileImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialIcons name="add-a-photo" size={40} color="#6b7280" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {profile.profilePhoto && (
        <TouchableOpacity 
          style={styles.removePhotoButton}
          onPress={() => updateProfile('profilePhoto', undefined)}
        >
          <Text style={styles.removePhotoText}>Remove Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAuthScreen = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.header}>PawPair</Text>
      <Text style={styles.subtext}>
        {isLogin ? 'Welcome back!' : 'Join the pack!'}
      </Text>
      {renderInput('Email', 'email', 'email-address')}
      {renderPasswordInput('Password', 'password')}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.link}>
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserTypeScreen = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.header}>I want to...</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleUserTypeSelection('owner')}
      >
        <Text style={styles.emoji}>🐕</Text>
        <Text style={styles.title}>Find care for my dog</Text>
        <Text style={styles.subtext}>
          I&apos;m a dog owner looking for trusted sitters
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleUserTypeSelection('sitter')}
      >
        <Text style={styles.emoji}>❤️</Text>
        <Text style={styles.title}>Care for dogs (Get Paid)</Text>
        <Text style={styles.subtext}>
          I want to spend time with dogs and earn money
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.card, styles.careKarmaCard]}
        onPress={() => handleUserTypeSelection('sitter', true)}
      >
        <Text style={styles.emoji}>🎓</Text>
        <Text style={styles.title}>Care Karma - Earn Service Hours</Text>
        <Text style={styles.subtext}>
          High school students: care for dogs and earn community service hours
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOwnerProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Owner Profile</Text>
      
      <Text style={styles.sectionHeader}>Personal Information</Text>
      {renderPhotoUpload()}
      {renderInput('First Name', 'firstName')}
      {renderInput('Last Name', 'lastName')}
      {renderInput('Phone Number', 'phone', 'phone-pad')}
      {renderInput('Emergency Contact', 'emergencyContact')}
      
      <Text style={styles.sectionHeader}>Dog Information</Text>
      {renderInput('Dog Name', 'dogName')}
      {renderInput('Dog Breed', 'dogBreed')}
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
      
      {renderInput('Allergies/Sensitivities', 'dogAllergies')}
      {renderInput('Exercise Needs', 'dogExerciseNeeds')}
      {renderInput('Temperament', 'dogTemperament')}
      {renderInput('Health Issues (if any)', 'dogHealthIssues')}
      {renderInput('Training Level', 'dogTrainingLevel')}
      {renderInput('Vaccination Status', 'dogVaccinations')}
      {renderInput('Diet/Food Preferences', 'dogDiet')}
      
      <Text style={styles.sectionHeader}>Services Needed</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, needsSitting: !prev.needsSitting }))}
        >
          <Text style={styles.checkboxText}>
            {profile.needsSitting ? '✅' : '☐'} I need dog sitting services
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, needsWalking: !prev.needsWalking }))}
        >
          <Text style={styles.checkboxText}>
            {profile.needsWalking ? '✅' : '☐'} I need dog walking services
          </Text>
        </TouchableOpacity>
      </View>

      {profile.needsWalking && (
        <View>
          <Text style={styles.label}>Walking Preferences</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Duration per walk</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingDuration || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingDuration: value }))}
                placeholder="30 minutes"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Frequency</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingFrequency || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingFrequency: value }))}
                placeholder="Daily"
              />
            </View>
          </View>
        </View>
      )}

      <Text style={styles.sectionHeader}>Location Information</Text>
      {renderInput('Address', 'address')}
      {renderInput('City', 'city')}
      {renderInput('State/Province', 'state')}
      {renderInput('ZIP/Postal Code', 'zipCode')}

      <TouchableOpacity
        style={styles.button}
        onPress={handleProfileSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Profile...' : 'Complete Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCareKarmaProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.careKarmaBanner}>
        <Text style={styles.careKarmaEmoji}>🎓✨</Text>
        <Text style={styles.careKarmaTitle}>Care Karma Profile</Text>
        <Text style={styles.careKarmaSubtitle}>
          Earn community service hours while caring for dogs!
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Personal Information</Text>
      {renderPhotoUpload()}
      {renderInput('First Name', 'firstName')}
      {renderInput('Last Name', 'lastName')}
      {renderInput('Phone Number', 'phone', 'phone-pad')}

      <Text style={styles.sectionHeader}>School Information</Text>
      {renderInput('High School Name', 'schoolName')}
      {renderInput('Expected Graduation Year', 'graduationYear')}

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color="#2563eb" />
        <Text style={styles.infoText}>
          Your service hours will be tracked automatically. You&apos;ll earn hours for each dog sitting session you complete.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Dog Care Experience</Text>
      {renderInput('Experience with dogs', 'experience')}
      {renderInput('Max Distance (miles)', 'maxDistance', 'numeric')}

      <Text style={styles.sectionHeader}>Availability Preferences</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.label}>Preferred Start Time</Text>
          <TextInput
            style={styles.input}
            value={profile.preferredStartTime || ''}
            onChangeText={(value) => setProfile(prev => ({ ...prev, preferredStartTime: value }))}
            placeholder="15:00 (After school)"
          />
        </View>
        <View style={styles.timeInput}>
          <Text style={styles.label}>Preferred End Time</Text>
          <TextInput
            style={styles.input}
            value={profile.preferredEndTime || ''}
            onChangeText={(value) => setProfile(prev => ({ ...prev, preferredEndTime: value }))}
            placeholder="20:00"
          />
        </View>
      </View>

      <Text style={styles.label}>Services Offered</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, providesSitting: !prev.providesSitting }))}
        >
          <Text style={styles.checkboxText}>
            {profile.providesSitting ? '✅' : '☐'} I provide dog sitting services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, providesWalking: !prev.providesWalking }))}
        >
          <Text style={styles.checkboxText}>
            {profile.providesWalking ? '✅' : '☐'} I provide dog walking services
          </Text>
        </TouchableOpacity>
      </View>

      {profile.providesWalking && (
        <View>
          <Text style={styles.label}>Walking Service Details</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Walk duration offered</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingDuration || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingDuration: value }))}
                placeholder="30-60 minutes"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Available frequency</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingFrequency || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingFrequency: value }))}
                placeholder="Daily/Weekly"
              />
            </View>
          </View>
        </View>
      )}

      <Text style={styles.label}>Care Options</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, shortNotice: !prev.shortNotice }))}
        >
          <Text style={styles.checkboxText}>
            {profile.shortNotice ? '✅' : '☐'} Available for short notice requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, weekendCare: !prev.weekendCare }))}
        >
          <Text style={styles.checkboxText}>
            {profile.weekendCare ? '✅' : '☐'} Available on weekends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, holidayCare: !prev.holidayCare }))}
        >
          <Text style={styles.checkboxText}>
            {profile.holidayCare ? '✅' : '☐'} Available on holidays
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Location Information</Text>
      {renderInput('Address', 'address')}
      {renderInput('City', 'city')}
      {renderInput('State/Province', 'state')}
      {renderInput('ZIP/Postal Code', 'zipCode')}

      <TouchableOpacity
        style={styles.button}
        onPress={handleProfileSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Profile...' : 'Complete Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSitterProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Sitter Profile</Text>
      {renderPhotoUpload()}
      {renderInput('First Name', 'firstName')}
      {renderInput('Last Name', 'lastName')}
      {renderInput('Phone Number', 'phone', 'phone-pad')}
      {renderInput('Experience with dogs', 'experience')}
      {renderInput('Max Distance (miles)', 'maxDistance', 'numeric')}
      
      <Text style={styles.sectionHeader}>Availability Preferences</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.label}>Preferred Start Time</Text>
          <TextInput
            style={styles.input}
            value={profile.preferredStartTime || ''}
            onChangeText={(value) => setProfile(prev => ({ ...prev, preferredStartTime: value }))}
            placeholder="09:00"
          />
        </View>
        <View style={styles.timeInput}>
          <Text style={styles.label}>Preferred End Time</Text>
          <TextInput
            style={styles.input}
            value={profile.preferredEndTime || ''}
            onChangeText={(value) => setProfile(prev => ({ ...prev, preferredEndTime: value }))}
            placeholder="17:00"
          />
        </View>
      </View>

      <Text style={styles.label}>Services Offered</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, providesSitting: !prev.providesSitting }))}
        >
          <Text style={styles.checkboxText}>
            {profile.providesSitting ? '✅' : '☐'} I provide dog sitting services
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, providesWalking: !prev.providesWalking }))}
        >
          <Text style={styles.checkboxText}>
            {profile.providesWalking ? '✅' : '☐'} I provide dog walking services
          </Text>
        </TouchableOpacity>
      </View>

      {profile.providesWalking && (
        <View>
          <Text style={styles.label}>Walking Service Details</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Walk duration offered</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingDuration || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingDuration: value }))}
                placeholder="30-60 minutes"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Available frequency</Text>
              <TextInput
                style={styles.input}
                value={profile.walkingFrequency || ''}
                onChangeText={(value) => setProfile(prev => ({ ...prev, walkingFrequency: value }))}
                placeholder="Daily/Weekly"
              />
            </View>
          </View>
        </View>
      )}

      <Text style={styles.label}>Care Options</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, shortNotice: !prev.shortNotice }))}
        >
          <Text style={styles.checkboxText}>
            {profile.shortNotice ? '✅' : '☐'} Available for short notice requests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, overnightCare: !prev.overnightCare }))}
        >
          <Text style={styles.checkboxText}>
            {profile.overnightCare ? '✅' : '☐'} Available for overnight care
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, weekendCare: !prev.weekendCare }))}
        >
          <Text style={styles.checkboxText}>
            {profile.weekendCare ? '✅' : '☐'} Available on weekends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setProfile(prev => ({ ...prev, holidayCare: !prev.holidayCare }))}
        >
          <Text style={styles.checkboxText}>
            {profile.holidayCare ? '✅' : '☐'} Available on holidays
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Location Information</Text>
      {renderInput('Address', 'address')}
      {renderInput('City', 'city')}
      {renderInput('State/Province', 'state')}
      {renderInput('ZIP/Postal Code', 'zipCode')}

      <TouchableOpacity
        style={styles.button}
        onPress={handleProfileSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Profile...' : 'Complete Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCompleteScreen = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.emoji}>{profile.isCareKarma ? '🎓' : '🎉'}</Text>
      <Text style={styles.header}>Welcome to PawPair!</Text>
      <Text style={styles.subtext}>
        {profile.userType === 'owner'
          ? "You're all set! Start finding trusted sitters for your furry friend."
          : profile.isCareKarma
          ? "You're all set! Start earning community service hours by caring for dogs."
          : "You're all set! Start browsing dogs that need care."}
      </Text>
      {profile.isCareKarma && (
        <View style={styles.serviceHoursDisplay}>
          <Text style={styles.serviceHoursLabel}>Service Hours Earned:</Text>
          <Text style={styles.serviceHoursValue}>{profile.serviceHours || 0} hours</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => onAuthComplete(profile.userType!)}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  let content;
  switch (currentStep) {
    case 'login':
    case 'signup':
      content = renderAuthScreen();
      break;
    case 'userType':
      content = renderUserTypeScreen();
      break;
    case 'ownerProfile':
      content = renderOwnerProfileScreen();
      break;
    case 'sitterProfile':
      content = renderSitterProfileScreen();
      break;
    case 'careKarmaProfile':
      content = renderCareKarmaProfileScreen();
      break;
    case 'complete':
      content = renderCompleteScreen();
      break;
    default:
      content = renderAuthScreen();
  }

  return (
    <View style={{ flex: 1 }}>
      {content}

      {/* Dev buttons - only show on login screen */}
      {(currentStep === 'login' || currentStep === 'signup') && isLogin && (
        <>
          <TouchableOpacity
            style={styles.devButtonLeft}
            onPress={async () => {
              try {
                const { generateTestUsers } = await import('../utils/generateTestUsers');
                await generateTestUsers();
                Alert.alert(
                  'Demo Users Loaded',
                  '20 test users created!\n\nPassword: password123\n\nOwner: sarah.owner@test.com\nSitter: alex.rodriguez@test.com'
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to load demo users');
              }
            }}
          >
            <Text style={styles.devButtonText}>📦 Load</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.devButtonRight}
            onPress={async () => {
              Alert.alert(
                'Clear All Data',
                'Delete all users and app data?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const { clearAllAppData } = await import('../utils/userStorage');
                        await clearAllAppData();
                        Alert.alert('Success', 'All data cleared!');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to clear data');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.devButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  centeredContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },
  passwordInput: {
    width: '100%',
    padding: 12,
    paddingRight: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  link: {
    marginTop: 16,
    color: '#2563eb'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  subtext: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#2563eb',
    textAlign: 'center'
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
    minWidth: '45%',
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4
  },
  checkboxContainer: {
    marginBottom: 20
  },
  checkbox: {
    marginBottom: 12
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151'
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151'
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#374151',
  },
  photoUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  removePhotoButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removePhotoText: {
    fontSize: 12,
    color: '#dc2626',
  },
  careKarmaCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
  },
  careKarmaBanner: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  careKarmaEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  careKarmaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  careKarmaSubtitle: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    lineHeight: 20,
  },
  serviceHoursDisplay: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  serviceHoursLabel: {
    fontSize: 16,
    color: '#047857',
    marginBottom: 8,
  },
  serviceHoursValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
  },
  devButtonLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  devButtonRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  devButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AuthFlow;
