import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { generateTestUsers, clearAllUsers, listAllUsers } from '../utils/generateTestUsers';

interface DevMenuProps {
  visible: boolean;
  onClose: () => void;
}

const DevMenu: React.FC<DevMenuProps> = ({ visible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateUsers = async () => {
    setIsLoading(true);
    try {
      await generateTestUsers();
      Alert.alert('Success', 'Test users generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate test users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearUsers = async () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to clear all users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearAllUsers();
              Alert.alert('Success', 'All users cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear users');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleListUsers = async () => {
    setIsLoading(true);
    try {
      const users = await listAllUsers();
      Alert.alert('Users', `Total users: ${users.length}\n\n${users.map(u => `${u.firstName} ${u.lastName} (${u.userType})`).join('\n')}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to list users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Dev Menu</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleGenerateUsers}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Generate Test Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleListUsers}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>List All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleClearUsers}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.closeButton]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  closeButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DevMenu;