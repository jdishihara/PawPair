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
};

const AuthFlow = ({ onAuthComplete }: AuthFlowProps) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAuth = () => {
    if (!profile.email || !profile.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        setCurrentStep('complete');
      } else {
        setCurrentStep('userType');
      }
    }, 1000);
  };

  const handleUserTypeSelection = (type: UserType) => {
    updateProfile('userType', type);
    setCurrentStep(type === 'owner' ? 'ownerProfile' : 'sitterProfile');
  };

  const handleProfileSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep('complete');
    }, 1000);
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
          I'm a dog owner looking for trusted sitters
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
      {renderInput('First Name', 'firstName')}
      {renderInput('Last Name', 'lastName')}
      {renderInput('Phone Number', 'phone', 'phone-pad')}
      {renderInput('Emergency Contact', 'emergencyContact')}
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
  }
});

export default AuthFlow;
