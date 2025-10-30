import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCurrentUser } from '../utils/userStorage';
import { createBookingRequest } from '../utils/messageStorage';

interface BookingRequestModalProps {
  visible: boolean;
  conversationId: string;
  sitterEmail: string;
  sitterName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  visible,
  conversationId,
  sitterEmail,
  sitterName,
  onClose,
  onSuccess
}) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Dog info
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [dogWeight, setDogWeight] = useState('');
  const [dogSize, setDogSize] = useState<'small' | 'medium' | 'large' | 'extra_large' | undefined>();

  const [loading, setLoading] = useState(false);

  // Load user's dog information
  useEffect(() => {
    const loadDogInfo = async () => {
      const user = await getCurrentUser();
      if (user && user.dogName) {
        setDogName(user.dogName);
        setDogBreed(user.dogBreed || '');
        setDogAge(user.dogAge || '');
        setDogWeight(user.dogWeight || '');
        setDogSize(user.dogSize);
      }
      if (user && user.address) {
        setAddress(user.address);
      }
    };

    if (visible) {
      loadDogInfo();
    }
  }, [visible]);

  const handleSubmit = async () => {
    // Validation
    if (!date || !startTime || !endTime || !address || !dogName || !dogBreed) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const requestId = await createBookingRequest(conversationId, sitterEmail, {
        date,
        startTime,
        endTime,
        duration: duration || calculateDuration(startTime, endTime),
        address,
        dogName,
        dogBreed,
        dogAge,
        dogWeight,
        dogSize,
        specialInstructions: specialInstructions || undefined
      });

      if (requestId) {
        Alert.alert('Success', `Booking request sent to ${sitterName}!`);
        onSuccess();
        onClose();
        // Reset form
        resetForm();
      } else {
        Alert.alert('Error', 'Failed to send booking request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending booking request:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): string => {
    // Simple duration calculation (assumes same-day booking)
    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);
    const hours = endHour - startHour;
    return hours > 0 ? `${hours} hours` : '';
  };

  const resetForm = () => {
    setDate('');
    setStartTime('');
    setEndTime('');
    setDuration('');
    setSpecialInstructions('');
    // Keep dog info and address as they're from profile
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Request</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.subtitle}>Send booking request to {sitterName}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>

            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2024-03-15)"
              value={date}
              onChangeText={setDate}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM (e.g., 09:00)"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM (e.g., 17:00)"
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <Text style={styles.label}>Duration (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 8 hours"
              value={duration}
              onChangeText={setDuration}
            />

            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Where should the sitter go?"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dog Information</Text>

            <Text style={styles.label}>Dog Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your dog's name"
              value={dogName}
              onChangeText={setDogName}
            />

            <Text style={styles.label}>Breed *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dog breed"
              value={dogBreed}
              onChangeText={setDogBreed}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3 years"
                  value={dogAge}
                  onChangeText={setDogAge}
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 45 lbs"
                  value={dogWeight}
                  onChangeText={setDogWeight}
                />
              </View>
            </View>

            <Text style={styles.label}>Size</Text>
            <View style={styles.sizeButtons}>
              {(['small', 'medium', 'large', 'extra_large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    dogSize === size && styles.sizeButtonSelected
                  ]}
                  onPress={() => setDogSize(size)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    dogSize === size && styles.sizeButtonTextSelected
                  ]}>
                    {size.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special care instructions, feeding schedule, behavioral notes, etc."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Sending...' : 'Send Booking Request'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  content: {
    flex: 1,
    padding: 16
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12
  },
  timeInput: {
    flex: 1
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb'
  },
  sizeButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  sizeButtonText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize'
  },
  sizeButtonTextSelected: {
    color: '#fff',
    fontWeight: '500'
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
