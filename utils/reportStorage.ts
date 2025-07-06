// utils/reportStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './userStorage';

const REPORTS_KEY = 'pawpair_reports';

export interface UserReport {
  id: string;
  reporterId: string; // Email of person making the report
  reportedUserId: string; // Email of person being reported
  reason: string;
  comments?: string;
  timestamp: string;
}

export type ReportReason = 
  | 'inappropriate_behavior'
  | 'fake_profile'
  | 'harassment'
  | 'spam'
  | 'safety_concerns'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'inappropriate_behavior',
    label: 'Inappropriate Behavior',
    description: 'User acted inappropriately or unprofessionally'
  },
  {
    value: 'fake_profile',
    label: 'Fake Profile',
    description: 'Profile appears to be fake or misleading'
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'User sent inappropriate messages or harassed me'
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'User is sending spam or promotional content'
  },
  {
    value: 'safety_concerns',
    label: 'Safety Concerns',
    description: 'I have concerns about user safety or trustworthiness'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another reason not listed above'
  }
];

// Get all stored reports
const getStoredReports = async (): Promise<UserReport[]> => {
  try {
    const reportsJson = await AsyncStorage.getItem(REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error('Error getting stored reports:', error);
    return [];
  }
};

// Submit a new report
export const submitReport = async (
  reportedUserId: string,
  reason: ReportReason,
  comments?: string
): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }

    const reports = await getStoredReports();
    
    // Check if user already reported this person
    const existingReport = reports.find(
      report => report.reporterId === currentUser.email && 
                report.reportedUserId === reportedUserId
    );

    if (existingReport) {
      console.log('User already reported this person');
      return false; // Don't allow duplicate reports
    }

    const newReport: UserReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporterId: currentUser.email,
      reportedUserId,
      reason,
      comments: comments?.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    reports.push(newReport);
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    
    console.log('✅ Report submitted successfully');
    return true;
  } catch (error) {
    console.error('Error submitting report:', error);
    return false;
  }
};

// Get reports made by current user
export const getUserReports = async (): Promise<UserReport[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const reports = await getStoredReports();
    return reports.filter(report => report.reporterId === currentUser.email);
  } catch (error) {
    console.error('Error getting user reports:', error);
    return [];
  }
};

// Check if current user has reported a specific user
export const hasReportedUser = async (reportedUserId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const reports = await getStoredReports();
    return reports.some(
      report => report.reporterId === currentUser.email && 
                report.reportedUserId === reportedUserId
    );
  } catch (error) {
    console.error('Error checking if user reported:', error);
    return false;
  }
};

// Get all reports (admin function)
export const getAllReports = async (): Promise<UserReport[]> => {
  return await getStoredReports();
};

// Clear all reports for current user
export const clearUserReports = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const reports = await getStoredReports();
    const filteredReports = reports.filter(report => report.reporterId !== currentUser.email);
    
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error('Error clearing user reports:', error);
    return false;
  }
};