import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  AvailabilitySlot,
  DayAvailability,
  getUserAvailabilityInRange,
  saveAvailabilitySlot,
  removeAvailabilitySlot,
  setFullDayAvailability
} from '../utils/availabilityStorage';

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateSlots, setSelectedDateSlots] = useState<AvailabilitySlot[]>([]);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add slot form state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAvailability();
  }, [currentMonth]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const monthAvailability = await getUserAvailabilityInRange(startDate, endDate);
      setAvailability(monthAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayAvailability = (date: string): DayAvailability | undefined => {
    return availability.find(day => day.date === date);
  };

  const getDayStatus = (date: string): 'available' | 'partial' | 'unavailable' | 'none' => {
    const dayAvail = getDayAvailability(date);
    if (!dayAvail || dayAvail.slots.length === 0) return 'none';
    if (dayAvail.isFullyAvailable) return 'available';
    if (dayAvail.isPartiallyAvailable) return 'partial';
    return 'unavailable';
  };

  const formatDate = (date: string): string => {
    const dateObj = new Date(date + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const generateCalendarDays = (): string[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days: string[] = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  };

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
    const dayAvail = getDayAvailability(date);
    setSelectedDateSlots(dayAvail?.slots || []);
  };

  const handleAddSlot = async () => {
    if (!selectedDate) return;

    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    const success = await saveAvailabilitySlot(selectedDate, startTime, endTime, true, notes);
    if (success) {
      setShowAddSlotModal(false);
      setStartTime('09:00');
      setEndTime('17:00');
      setNotes('');
      await loadAvailability();
      const dayAvail = getDayAvailability(selectedDate);
      setSelectedDateSlots(dayAvail?.slots || []);
    } else {
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    Alert.alert(
      'Remove Availability',
      'Are you sure you want to remove this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeAvailabilitySlot(slotId);
            if (success) {
              await loadAvailability();
              if (selectedDate) {
                const dayAvail = getDayAvailability(selectedDate);
                setSelectedDateSlots(dayAvail?.slots || []);
              }
            } else {
              Alert.alert('Error', 'Failed to remove availability. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetFullDay = async (date: string) => {
    Alert.alert(
      'Set Full Day Availability',
      'Mark this entire day as available?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Available',
          onPress: async () => {
            const success = await setFullDayAvailability(date, true);
            if (success) {
              await loadAvailability();
              const dayAvail = getDayAvailability(date);
              setSelectedDateSlots(dayAvail?.slots || []);
            }
          }
        }
      ]
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendarDay = (date: string) => {
    const dayNumber = new Date(date + 'T00:00:00').getDate();
    const isCurrentMonth = new Date(date + 'T00:00:00').getMonth() === currentMonth.getMonth();
    const isToday = date === new Date().toISOString().split('T')[0];
    const status = getDayStatus(date);
    const isSelected = date === selectedDate;

    let dayStyle = [styles.calendarDay];
    let textStyle = [styles.calendarDayText];

    if (!isCurrentMonth) {
      dayStyle.push(styles.otherMonthDay);
      textStyle.push(styles.otherMonthText);
    }

    if (isToday) {
      dayStyle.push(styles.todayDay);
      textStyle.push(styles.todayText);
    }

    if (isSelected) {
      dayStyle.push(styles.selectedDay);
      textStyle.push(styles.selectedText);
    }

    switch (status) {
      case 'available':
        dayStyle.push(styles.availableDay);
        break;
      case 'partial':
        dayStyle.push(styles.partialDay);
        break;
      case 'unavailable':
        dayStyle.push(styles.unavailableDay);
        break;
    }

    return (
      <TouchableOpacity
        key={date}
        style={dayStyle}
        onPress={() => handleDatePress(date)}
        disabled={!isCurrentMonth}
      >
        <Text style={textStyle}>{dayNumber}</Text>
        {status !== 'none' && (
          <View style={[styles.statusDot, 
            status === 'available' ? styles.availableDot :
            status === 'partial' ? styles.partialDot : styles.unavailableDot
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSlotItem = ({ item }: { item: AvailabilitySlot }) => (
    <View style={styles.slotItem}>
      <View style={styles.slotInfo}>
        <Text style={styles.slotTime}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <Text style={[styles.slotStatus, item.isAvailable ? styles.availableStatus : styles.unavailableStatus]}>
          {item.isAvailable ? 'Available' : 'Not Available'}
        </Text>
        {item.notes && <Text style={styles.slotNotes}>{item.notes}</Text>}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveSlot(item.id)}
      >
        <MaterialIcons name="delete" size={20} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );

  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Calendar</Text>
        <Text style={styles.headerSubtitle}>Set your availability for dog sitting</Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <MaterialIcons name="chevron-right" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.calendarGrid}>
          {calendarDays.map(renderCalendarDay)}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.partialDot]} />
          <Text style={styles.legendText}>Partially Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unavailableDot]} />
          <Text style={styles.legendText}>Not Available</Text>
        </View>
      </View>

      {/* Selected Date Details */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <View style={styles.selectedDateHeader}>
            <Text style={styles.selectedDateTitle}>
              {formatDate(selectedDate)}
            </Text>
            <View style={styles.selectedDateActions}>
              <TouchableOpacity
                style={styles.fullDayButton}
                onPress={() => handleSetFullDay(selectedDate)}
              >
                <Text style={styles.fullDayButtonText}>Full Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddSlotModal(true)}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedDateSlots.length === 0 ? (
            <Text style={styles.noSlotsText}>No availability set for this day</Text>
          ) : (
            <FlatList
              data={selectedDateSlots}
              renderItem={renderSlotItem}
              keyExtractor={(item) => item.id}
              style={styles.slotsList}
            />
          )}
        </View>
      )}

      {/* Add Slot Modal */}
      <Modal
        visible={showAddSlotModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddSlotModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Availability</Text>
            <TouchableOpacity onPress={handleAddSlot}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDate}>
              {selectedDate && formatDate(selectedDate)}
            </Text>

            <View style={styles.timeContainer}>
              <View style={styles.timeField}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                />
              </View>

              <View style={styles.timeField}>
                <Text style={styles.timeLabel}>End Time</Text>
                <TextInput
                  style={styles.timeInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.notesField}>
              <Text style={styles.notesLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about your availability..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 16
  },
  navButton: {
    padding: 8
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  calendarContainer: {
    paddingHorizontal: 20
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    width: 40
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
    position: 'relative'
  },
  calendarDayText: {
    fontSize: 16,
    color: '#111827'
  },
  otherMonthDay: {
    opacity: 0.3
  },
  otherMonthText: {
    color: '#9ca3af'
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#2563eb'
  },
  todayText: {
    color: '#2563eb',
    fontWeight: 'bold'
  },
  selectedDay: {
    backgroundColor: '#2563eb'
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  availableDay: {
    backgroundColor: '#dcfce7'
  },
  partialDay: {
    backgroundColor: '#fef3c7'
  },
  unavailableDay: {
    backgroundColor: '#fef2f2'
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3
  },
  availableDot: {
    backgroundColor: '#16a34a'
  },
  partialDot: {
    backgroundColor: '#d97706'
  },
  unavailableDot: {
    backgroundColor: '#dc2626'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280'
  },
  selectedDateContainer: {
    flex: 1,
    padding: 20
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1
  },
  selectedDateActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fullDayButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8
  },
  fullDayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noSlotsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 32
  },
  slotsList: {
    flex: 1
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  slotInfo: {
    flex: 1
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  slotStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  availableStatus: {
    color: '#16a34a'
  },
  unavailableStatus: {
    color: '#dc2626'
  },
  slotNotes: {
    fontSize: 12,
    color: '#6b7280'
  },
  removeButton: {
    padding: 8
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb'
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center'
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  timeField: {
    flex: 1,
    marginHorizontal: 8
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center'
  },
  notesField: {
    marginBottom: 24
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top'
  }
});