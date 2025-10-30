// app/SitterProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { clearCurrentUser, getCurrentUser } from '../utils/userStorage';
import { UserProfile } from './AuthFlow';
import EditProfileScreen from './EditProfileScreen';

interface SitterProfileScreenProps {
  onLogout?: () => void;
}

export default function SitterProfileScreen({ onLogout }: SitterProfileScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <EditProfileScreen
        userProfile={userProfile}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        {userProfile.isCareKarma ? 'Care Karma Profile' : 'Sitter Profile'}
      </Text>

      {userProfile.isCareKarma && (
        <View style={styles.careKarmaBanner}>
          <Text style={styles.careKarmaEmoji}>🎓</Text>
          <Text style={styles.careKarmaTitle}>Community Service Hours</Text>
          <Text style={styles.serviceHoursValue}>{userProfile.serviceHours || 0} hours</Text>
          <Text style={styles.careKarmaSubtitle}>
            Earning service hours through dog care
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.info}>Name: {userProfile.firstName} {userProfile.lastName}</Text>
        <Text style={styles.info}>Email: {userProfile.email}</Text>
        <Text style={styles.info}>Phone: {userProfile.phone}</Text>
        {userProfile.isCareKarma && userProfile.schoolName && (
          <Text style={styles.info}>School: {userProfile.schoolName}</Text>
        )}
        {userProfile.isCareKarma && userProfile.graduationYear && (
          <Text style={styles.info}>Graduation Year: {userProfile.graduationYear}</Text>
        )}
      </View>

      {userProfile.experience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.info}>Experience with dogs: {userProfile.experience}</Text>
        </View>
      )}

      {userProfile.maxDistance && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Area</Text>
          <Text style={styles.info}>Maximum distance: {userProfile.maxDistance} miles</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      
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
  editButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    minWidth: 120,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  careKarmaBanner: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%'
  },
  careKarmaEmoji: {
    fontSize: 40,
    marginBottom: 8
  },
  careKarmaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8
  },
  careKarmaSubtitle: {
    fontSize: 14,
    color: '#047857',
    marginTop: 4
  },
  serviceHoursValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#059669'
  }
});