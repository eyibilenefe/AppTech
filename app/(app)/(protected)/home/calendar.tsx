import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meal' | 'sport' | 'academic' | 'social';
  location: string;
}

const CalendarScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events: Event[] = [
    {
      id: '1',
      title: 'Vegetarian Lunch Reservation',
      date: 'Today',
      time: '12:30 - 13:00',
      type: 'meal',
      location: 'Main Cafeteria'
    },
    {
      id: '2',
      title: 'Tennis Court 1 Booking',
      date: 'Tomorrow',
      time: '15:00 - 16:00',
      type: 'sport',
      location: 'Sports Center'
    },
    {
      id: '3',
      title: 'Computer Engineering Lecture',
      date: 'Tomorrow',
      time: '09:00 - 10:30',
      type: 'academic',
      location: 'Lecture Hall A'
    },
    {
      id: '4',
      title: 'Study Group Meeting',
      date: 'Friday',
      time: '14:00 - 16:00',
      type: 'social',
      location: 'Library Study Room 3'
    },
    {
      id: '5',
      title: 'Gym Session',
      date: 'Saturday',
      time: '10:00 - 11:00',
      type: 'sport',
      location: 'Fitness Center'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meal': return 'restaurant';
      case 'sport': return 'fitness-center';
      case 'academic': return 'school';
      case 'social': return 'people';
      default: return 'event';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meal': return '#FF6B35';
      case 'sport': return '#4CAF50';
      case 'academic': return '#9a0f21';
      case 'social': return '#9C27B0';
      default: return '#666';
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const today = new Date().getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity>
          <MaterialIcons name="today" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity style={styles.navButton}>
            <MaterialIcons name="chevron-left" size={24} color="#9a0f21" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{currentMonth} {currentYear}</Text>
          <TouchableOpacity style={styles.navButton}>
            <MaterialIcons name="chevron-right" size={24} color="#9a0f21" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Names */}
          <View style={styles.dayNamesRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
              <Text key={dayName} style={styles.dayName}>
                {dayName}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day === today && styles.todayCell,
                  !day && styles.emptyCell
                ]}
                disabled={!day}
                onPress={() => day && setSelectedDate(new Date(currentYear, new Date().getMonth(), day))}
              >
                {day && (
                  <Text style={[
                    styles.dayText,
                    day === today && styles.todayText
                  ]}>
                    {day}
                  </Text>
                )}
                {day === today && <View style={styles.todayDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {events.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventIconContainer}>
                <MaterialIcons 
                  name={getEventIcon(event.type) as any} 
                  size={24} 
                  color={getEventColor(event.type)} 
                />
              </View>
              
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <MaterialIcons name="schedule" size={14} color="#666" />
                  <Text style={styles.eventTime}>{event.date} • {event.time}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <MaterialIcons name="location-on" size={14} color="#666" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.eventMenu}>
                <MaterialIcons name="more-vert" size={20} color="#ccc" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(app)/(protected)/home/cafeteria-reservation')}
            >
              <MaterialIcons name="restaurant" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>Food Reservation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(app)/(protected)/home/facility-reservation')}
            >
              <MaterialIcons name="fitness-center" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Sport Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="event-note" size={24} color="#9a0f21" />
              <Text style={styles.actionText}>Add Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="notifications" size={24} color="#9C27B0" />
              <Text style={styles.actionText}>Reminders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>This Month</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="restaurant" size={20} color="#FF6B35" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={20} color="#4CAF50" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="school" size={20} color="#9a0f21" />
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="people" size={20} color="#9C27B0" />
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>Social</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#9a0f21',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyCell: {
    opacity: 0,
  },
  todayCell: {
    backgroundColor: '#9a0f21',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  eventsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
  },
  eventMenu: {
    padding: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default CalendarScreen; 