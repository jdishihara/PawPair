import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BookingRequest, updateBookingRequestStatus } from '../utils/messageStorage';

interface BookingRequestCardProps {
  bookingRequest: BookingRequest;
  isOwner: boolean; // Is current user the owner (requester)?
  onStatusUpdate?: () => void; // Callback after status update
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  bookingRequest,
  isOwner,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const success = await updateBookingRequestStatus(bookingRequest.id, 'accepted');
      if (success) {
        Alert.alert('Success', 'Booking request accepted!');
        onStatusUpdate?.();
      } else {
        Alert.alert('Error', 'Failed to accept booking request.');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await updateBookingRequestStatus(bookingRequest.id, 'declined');
              if (success) {
                Alert.alert('Declined', 'Booking request declined.');
                onStatusUpdate?.();
              } else {
                Alert.alert('Error', 'Failed to decline booking request.');
              }
            } catch (error) {
              console.error('Error declining booking:', error);
              Alert.alert('Error', 'Something went wrong.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = () => {
    switch (bookingRequest.status) {
      case 'accepted':
        return '#10b981';
      case 'declined':
        return '#dc2626';
      default:
        return '#f59e0b';
    }
  };

  const getStatusIcon = () => {
    switch (bookingRequest.status) {
      case 'accepted':
        return 'check-circle';
      case 'declined':
        return 'cancel';
      default:
        return 'schedule';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="calendar-today" size={20} color="#2563eb" />
        <Text style={styles.headerTitle}>Booking Request</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <MaterialIcons name={getStatusIcon()} size={14} color="#fff" />
          <Text style={styles.statusText}>{bookingRequest.status}</Text>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <MaterialIcons name="event" size={18} color="#6b7280" />
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(bookingRequest.date)}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="access-time" size={18} color="#6b7280" />
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {bookingRequest.startTime} - {bookingRequest.endTime}
          </Text>
        </View>

        {bookingRequest.duration && (
          <View style={styles.row}>
            <MaterialIcons name="timelapse" size={18} color="#6b7280" />
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{bookingRequest.duration}</Text>
          </View>
        )}

        <View style={styles.row}>
          <MaterialIcons name="location-on" size={18} color="#6b7280" />
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{bookingRequest.address}</Text>
        </View>
      </View>

      {/* Dog Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dog Information</Text>

        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>🐕 {bookingRequest.dogName}</Text>
          <Text style={styles.dogDetail}>
            {bookingRequest.dogBreed} • {bookingRequest.dogAge} • {bookingRequest.dogWeight}
          </Text>
          {bookingRequest.dogSize && (
            <Text style={styles.dogDetail}>
              Size: {bookingRequest.dogSize.replace('_', ' ')}
            </Text>
          )}
        </View>
      </View>

      {/* Special Instructions */}
      {bookingRequest.specialInstructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Text style={styles.instructions}>{bookingRequest.specialInstructions}</Text>
        </View>
      )}

      {/* Action Buttons (only for sitters with pending requests) */}
      {!isOwner && bookingRequest.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
            disabled={loading}
          >
            <MaterialIcons name="close" size={20} color="#dc2626" />
            <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            disabled={loading}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={[styles.buttonText, styles.acceptButtonText]}>
              {loading ? 'Processing...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Message for Owner */}
      {isOwner && bookingRequest.status !== 'pending' && (
        <View style={styles.statusMessage}>
          <MaterialIcons
            name={bookingRequest.status === 'accepted' ? 'check-circle' : 'cancel'}
            size={20}
            color={bookingRequest.status === 'accepted' ? '#10b981' : '#dc2626'}
          />
          <Text style={[
            styles.statusMessageText,
            { color: bookingRequest.status === 'accepted' ? '#10b981' : '#dc2626' }
          ]}>
            {bookingRequest.status === 'accepted'
              ? 'This booking request was accepted!'
              : 'This booking request was declined.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    flex: 1
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  },
  section: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1
  },
  dogInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8
  },
  dogName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  dogDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  instructions: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6
  },
  acceptButton: {
    backgroundColor: '#10b981'
  },
  declineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc2626'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  acceptButtonText: {
    color: '#fff'
  },
  declineButtonText: {
    color: '#dc2626'
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
    marginTop: 8
  },
  statusMessageText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  }
});
