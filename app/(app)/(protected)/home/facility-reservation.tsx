import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Facility {
  id: string;
  name: string;
  icon: string;
  price: string;
  capacity: string;
  description: string;
}

const FacilityReservationScreen = () => {
  const router = useRouter();
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const facilities: Facility[] = [
    {
      id: 'tennis1',
      name: 'Tennis Court 1',
      icon: 'sports-tennis',
      price: '25₺/hour',
      capacity: '4 people',
      description: 'Professional tennis court with lighting'
    },
    {
      id: 'tennis2',
      name: 'Tennis Court 2',
      icon: 'sports-tennis',
      price: '25₺/hour',
      capacity: '4 people',
      description: 'Professional tennis court with lighting'
    },
    {
      id: 'gym',
      name: 'Fitness Center',
      icon: 'fitness-center',
      price: '15₺/hour',
      capacity: '30 people',
      description: 'Modern gym with cardio and weight equipment'
    },
    {
      id: 'basketball',
      name: 'Basketball Court',
      icon: 'sports-basketball',
      price: '20₺/hour',
      capacity: '10 people',
      description: 'Indoor basketball court'
    },
    {
      id: 'swimming',
      name: 'Swimming Pool',
      icon: 'pool',
      price: '12₺/hour',
      capacity: '25 people',
      description: 'Olympic-size swimming pool'
    },
    {
      id: 'volleyball',
      name: 'Volleyball Court',
      icon: 'sports-volleyball',
      price: '18₺/hour',
      capacity: '12 people',
      description: 'Indoor volleyball court'
    }
  ];

  const dates = [
    { label: 'Today', value: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: 'In 2 Days', value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: 'In 3 Days', value: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: 'In 4 Days', value: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ];

  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00'
  ];

  const handleBackPress = () => {
    router.back();
  };

  const handleCompleteReservation = () => {
    if (!selectedFacility || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select facility, date, and time');
      return;
    }

    const selectedFacilityData = facilities.find(facility => facility.id === selectedFacility);
    
    Alert.alert(
      'Confirm Reservation',
      `Facility: ${selectedFacilityData?.name}\nDate: ${dates.find(d => d.value === selectedDate)?.label}\nTime: ${selectedTime}\nPrice: ${selectedFacilityData?.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Reservation completed successfully!');
            router.back();
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sport Reservation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#4CAF50" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sports Center Hours</Text>
            <Text style={styles.infoText}>Monday - Friday: 8:00 AM - 10:00 PM</Text>
            <Text style={styles.infoText}>Saturday - Sunday: 9:00 AM - 9:00 PM</Text>
          </View>
        </View>

        {/* Facility Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Facility</Text>
          <View style={styles.facilityGrid}>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={[
                  styles.facilityCard,
                  selectedFacility === facility.id && styles.facilityCardSelected
                ]}
                onPress={() => setSelectedFacility(facility.id)}
              >
                <MaterialIcons 
                  name={facility.icon as any} 
                  size={32} 
                  color={selectedFacility === facility.id ? '#4CAF50' : '#666'} 
                />
                <Text style={[
                  styles.facilityName,
                  selectedFacility === facility.id && styles.facilityNameSelected
                ]}>
                  {facility.name}
                </Text>
                <Text style={styles.facilityPrice}>{facility.price}</Text>
                <Text style={styles.facilityCapacity}>{facility.capacity}</Text>
                <Text style={styles.facilityDescription}>{facility.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.dateScrollView}
          >
            <View style={styles.dateContainer}>
              {dates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.dateButton,
                    selectedDate === date.value && styles.dateButtonSelected
                  ]}
                  onPress={() => setSelectedDate(date.value)}
                >
                  <Text style={[
                    styles.dateButtonText,
                    selectedDate === date.value && styles.dateButtonTextSelected
                  ]}>
                    {date.label}
                  </Text>
                  <Text style={[
                    styles.dateButtonSubtext,
                    selectedDate === date.value && styles.dateButtonSubtextSelected
                  ]}>
                    {new Date(date.value).toLocaleDateString('tr-TR', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.timeButtonSelected
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <MaterialIcons 
                  name="access-time" 
                  size={16} 
                  color={selectedTime === time ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.timeButtonText,
                  selectedTime === time && styles.timeButtonTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reservation Summary */}
        {selectedFacility && selectedDate && selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reservation Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Facility</Text>
                <Text style={styles.summaryValue}>
                  {facilities.find(facility => facility.id === selectedFacility)?.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {dates.find(d => d.value === selectedDate)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Capacity</Text>
                <Text style={styles.summaryValue}>
                  {facilities.find(facility => facility.id === selectedFacility)?.capacity}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Total Price</Text>
                <Text style={styles.summaryValueTotal}>
                  {facilities.find(facility => facility.id === selectedFacility)?.price}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Complete Reservation Button */}
        <TouchableOpacity 
          style={[
            styles.reservationButton,
            (!selectedFacility || !selectedDate || !selectedTime) && styles.reservationButtonDisabled
          ]}
          onPress={handleCompleteReservation}
          disabled={!selectedFacility || !selectedDate || !selectedTime}
        >
          <MaterialIcons name="sports" size={20} color="#fff" />
          <Text style={styles.reservationButtonText}>Complete Reservation</Text>
        </TouchableOpacity>

        {/* Rules & Guidelines */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Rules & Guidelines</Text>
          <View style={styles.ruleItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>Arrive 5 minutes before your reserved time</Text>
          </View>
          <View style={styles.ruleItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>Bring your student ID for verification</Text>
          </View>
          <View style={styles.ruleItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>Cancellations must be made 2 hours in advance</Text>
          </View>
          <View style={styles.ruleItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.ruleText}>Equipment can be rented at the front desk</Text>
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
    backgroundColor: '#4CAF50',
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
  infoCard: {
    flexDirection: 'row',
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
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  facilityGrid: {
    gap: 12,
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  facilityCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  facilityNameSelected: {
    color: '#4CAF50',
  },
  facilityPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 2,
  },
  facilityCapacity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  facilityDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  dateScrollView: {
    marginHorizontal: -16,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateButtonTextSelected: {
    color: '#4CAF50',
  },
  dateButtonSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  dateButtonSubtextSelected: {
    color: '#4CAF50',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  timeButtonTextSelected: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  reservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reservationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reservationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  rulesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default FacilityReservationScreen; 