import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './userStorage';

const AVAILABILITY_KEY = 'pawpair_availability';

export interface AvailabilitySlot {
  id: string;
  userEmail: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  isFullyAvailable: boolean;
  isPartiallyAvailable: boolean;
}

// Get all stored availability data
const getStoredAvailability = async (): Promise<AvailabilitySlot[]> => {
  try {
    const availabilityJson = await AsyncStorage.getItem(AVAILABILITY_KEY);
    return availabilityJson ? JSON.parse(availabilityJson) : [];
  } catch (error) {
    console.error('Error getting stored availability:', error);
    return [];
  }
};

// Save availability slot
export const saveAvailabilitySlot = async (
  date: string,
  startTime: string,
  endTime: string,
  isAvailable: boolean,
  notes?: string
): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return false;
    }

    const allAvailability = await getStoredAvailability();
    const now = new Date().toISOString();

    // Check if slot already exists for this user, date, and time
    const existingSlotIndex = allAvailability.findIndex(
      slot => slot.userEmail === currentUser.email && 
              slot.date === date && 
              slot.startTime === startTime && 
              slot.endTime === endTime
    );

    const newSlot: AvailabilitySlot = {
      id: existingSlotIndex >= 0 ? allAvailability[existingSlotIndex].id : `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: currentUser.email,
      date,
      startTime,
      endTime,
      isAvailable,
      notes,
      createdAt: existingSlotIndex >= 0 ? allAvailability[existingSlotIndex].createdAt : now,
      updatedAt: now
    };

    if (existingSlotIndex >= 0) {
      allAvailability[existingSlotIndex] = newSlot;
    } else {
      allAvailability.push(newSlot);
    }

    await AsyncStorage.setItem(AVAILABILITY_KEY, JSON.stringify(allAvailability));
    console.log('✅ Availability slot saved:', newSlot.id);
    return true;
  } catch (error) {
    console.error('Error saving availability slot:', error);
    return false;
  }
};

// Get availability for current user on a specific date
export const getUserAvailabilityForDate = async (date: string): Promise<AvailabilitySlot[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const allAvailability = await getStoredAvailability();
    return allAvailability.filter(
      slot => slot.userEmail === currentUser.email && slot.date === date
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  } catch (error) {
    console.error('Error getting user availability for date:', error);
    return [];
  }
};

// Get availability for current user in a date range
export const getUserAvailabilityInRange = async (startDate: string, endDate: string): Promise<DayAvailability[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const allAvailability = await getStoredAvailability();
    const userAvailability = allAvailability.filter(
      slot => slot.userEmail === currentUser.email && 
              slot.date >= startDate && 
              slot.date <= endDate
    );

    // Group by date
    const availabilityByDate: { [date: string]: AvailabilitySlot[] } = {};
    userAvailability.forEach(slot => {
      if (!availabilityByDate[slot.date]) {
        availabilityByDate[slot.date] = [];
      }
      availabilityByDate[slot.date].push(slot);
    });

    // Create DayAvailability objects
    const result: DayAvailability[] = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySlots = availabilityByDate[dateStr] || [];
      
      const availableSlots = daySlots.filter(slot => slot.isAvailable);
      const isFullyAvailable = daySlots.length > 0 && daySlots.every(slot => slot.isAvailable);
      const isPartiallyAvailable = availableSlots.length > 0 && availableSlots.length < daySlots.length;

      result.push({
        date: dateStr,
        slots: daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        isFullyAvailable,
        isPartiallyAvailable
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error('Error getting user availability in range:', error);
    return [];
  }
};

// Set full day availability
export const setFullDayAvailability = async (date: string, isAvailable: boolean): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    // Remove existing slots for this date
    await removeAvailabilityForDate(date);

    if (isAvailable) {
      // Add a full day slot (9 AM to 6 PM by default)
      return await saveAvailabilitySlot(date, '09:00', '18:00', true, 'Available all day');
    }

    return true;
  } catch (error) {
    console.error('Error setting full day availability:', error);
    return false;
  }
};

// Remove availability for a specific date
export const removeAvailabilityForDate = async (date: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return false;
    }

    const allAvailability = await getStoredAvailability();
    const filteredAvailability = allAvailability.filter(
      slot => !(slot.userEmail === currentUser.email && slot.date === date)
    );

    await AsyncStorage.setItem(AVAILABILITY_KEY, JSON.stringify(filteredAvailability));
    console.log('✅ Availability removed for date:', date);
    return true;
  } catch (error) {
    console.error('Error removing availability for date:', error);
    return false;
  }
};

// Remove specific availability slot
export const removeAvailabilitySlot = async (slotId: string): Promise<boolean> => {
  try {
    const allAvailability = await getStoredAvailability();
    const filteredAvailability = allAvailability.filter(slot => slot.id !== slotId);

    await AsyncStorage.setItem(AVAILABILITY_KEY, JSON.stringify(filteredAvailability));
    console.log('✅ Availability slot removed:', slotId);
    return true;
  } catch (error) {
    console.error('Error removing availability slot:', error);
    return false;
  }
};

// Get availability for any user by email (for matching purposes)
export const getUserAvailabilityByEmail = async (userEmail: string, date: string): Promise<AvailabilitySlot[]> => {
  try {
    const allAvailability = await getStoredAvailability();
    return allAvailability.filter(
      slot => slot.userEmail === userEmail && slot.date === date && slot.isAvailable
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  } catch (error) {
    console.error('Error getting user availability by email:', error);
    return [];
  }
};

// Check if user is available on a specific date
export const isUserAvailableOnDate = async (userEmail: string, date: string): Promise<boolean> => {
  try {
    const availability = await getUserAvailabilityByEmail(userEmail, date);
    return availability.length > 0;
  } catch (error) {
    console.error('Error checking user availability:', error);
    return false;
  }
};

// Get next available dates for current user
export const getNextAvailableDates = async (limit: number = 10): Promise<string[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const startDate = today.toISOString().split('T')[0];
    const endDate = thirtyDaysFromNow.toISOString().split('T')[0];

    const availability = await getUserAvailabilityInRange(startDate, endDate);
    
    return availability
      .filter(day => day.isFullyAvailable || day.isPartiallyAvailable)
      .slice(0, limit)
      .map(day => day.date);
  } catch (error) {
    console.error('Error getting next available dates:', error);
    return [];
  }
};

// Bulk update availability for multiple dates
export const bulkUpdateAvailability = async (
  dates: string[],
  isAvailable: boolean,
  startTime?: string,
  endTime?: string
): Promise<boolean> => {
  try {
    for (const date of dates) {
      const success = await saveAvailabilitySlot(
        date,
        startTime || '09:00',
        endTime || '18:00',
        isAvailable,
        isAvailable ? 'Available' : 'Not available'
      );
      if (!success) {
        console.error('Failed to update availability for date:', date);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    return false;
  }
};