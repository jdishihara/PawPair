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
import { isEmailRegistered, saveUserProfile, setCurrentUser, validateLogin } from '../utils/userStorage';

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
  | 'complete';

export type UserProfile = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: UserType;
  emergencyContact?: string;
  experience?: string;
  homeType?: 'apartment' | 'house' | 'house_with_yard';
  hasOtherPets?: boolean;
  maxDistance?: number;
  preferredSizes?: string[];
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
};

const AuthFlow = ({ onAuthComplete }: AuthFlowProps) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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

  const handleUserTypeSelection = (type: UserType) => {
    updateProfile('userType', type);
    setCurrentStep(type === 'owner' ? 'ownerProfile' : 'sitterProfile');
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
      const success = await saveUserProfile(profile as UserProfile);
      if (success) {
        await setCurrentUser(profile as UserProfile);
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

  const renderAuthScreen = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.header}>PawPair</Text>
      <Text style={styles.subtext}>
        {isLogin ? 'Welcome back!' : 'Join the pack!'}
      </Text>
      {renderInput('Email', 'email', 'email-address')}
      {renderInput('Password', 'password')}
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
        <Text style={styles.title}>Care for dogs</Text>
        <Text style={styles.subtext}>
          I want to spend time with dogs temporarily
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOwnerProfileScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Owner Profile</Text>
      
      <Text style={styles.sectionHeader}>Personal Information</Text>
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
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.header}>Welcome to PawPair!</Text>
      <Text style={styles.subtext}>
        {profile.userType === 'owner'
          ? "You're all set! Start finding trusted sitters for your furry friend."
          : "You're all set! Start browsing dogs that need care."}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onAuthComplete(profile.userType!)}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  switch (currentStep) {
    case 'login':
    case 'signup':
      return renderAuthScreen();
    case 'userType':
      return renderUserTypeScreen();
    case 'ownerProfile':
      return renderOwnerProfileScreen();
    case 'sitterProfile':
      return renderSitterProfileScreen();
    case 'complete':
      return renderCompleteScreen();
    default:
      return renderAuthScreen();
  }
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
  }
});

export default AuthFlow;
