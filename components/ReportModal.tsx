// components/ReportModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { submitReport, REPORT_REASONS, ReportReason } from '../utils/reportStorage';

type ReportModalProps = {
  visible: boolean;
  reportedUserEmail: string;
  reportedUserName: string;
  onClose: () => void;
  onReportSubmitted: () => void;
};

export default function ReportModal({
  visible,
  reportedUserEmail,
  reportedUserName,
  onClose,
  onReportSubmitted
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Please select a reason', 'You must select a reason for reporting this user.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitReport(reportedUserEmail, selectedReason, comments);
      
      if (success) {
        Alert.alert(
          'Report Submitted',
          'Thank you for your report. We will review it and take appropriate action.',
          [{ text: 'OK', onPress: onReportSubmitted }]
        );
        handleClose();
      } else {
        Alert.alert(
          'Already Reported',
          'You have already reported this user. We are reviewing your previous report.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setComments('');
    onClose();
  };

  const renderReasonOption = (reason: typeof REPORT_REASONS[0]) => (
    <TouchableOpacity
      key={reason.value}
      style={[
        styles.reasonOption,
        selectedReason === reason.value && styles.reasonOptionSelected
      ]}
      onPress={() => setSelectedReason(reason.value)}
    >
      <View style={styles.reasonContent}>
        <View style={[
          styles.radioButton,
          selectedReason === reason.value && styles.radioButtonSelected
        ]}>
          {selectedReason === reason.value && (
            <MaterialIcons name="check" size={16} color="#fff" />
          )}
        </View>
        <View style={styles.reasonText}>
          <Text style={styles.reasonLabel}>{reason.label}</Text>
          <Text style={styles.reasonDescription}>{reason.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report User</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfo}>
            <MaterialIcons name="report" size={40} color="#dc2626" />
            <Text style={styles.reportingText}>
              You are reporting <Text style={styles.userName}>{reportedUserName}</Text>
            </Text>
            <Text style={styles.subtitle}>
              Please select a reason for reporting this user. Your report will be reviewed by our team.
            </Text>
          </View>

          <View style={styles.reasonsSection}>
            <Text style={styles.sectionTitle}>Reason for Report</Text>
            {REPORT_REASONS.map(renderReasonOption)}
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="Provide additional details about your report..."
              placeholderTextColor="#9ca3af"
              value={comments}
              onChangeText={setComments}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{comments.length}/500</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  reportingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 20,
  },
  reasonsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  reasonOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  reasonOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  reasonText: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
    backgroundColor: '#f9fafb',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});