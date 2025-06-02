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

interface ReservationType {
  id: string;
  name: string;
  icon: string;
  price: string;
  description: string;
}

const CafeteriaReservationScreen = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const reservationTypes: ReservationType[] = [
    {
      id: 'vegetarian',
      name: 'Vegetarian Lunch',
      icon: 'eco',
      price: '12₺',
      description: 'Fresh salads, grilled vegetables, and veggie protein'
    },
    {
      id: 'vegan',
      name: 'Vegan Lunch',
      icon: 'grass',
      price: '15₺',
      description: 'Plant-based meals with no animal products'
    },
    {
      id: 'regular',
      name: 'Regular Lunch',
      icon: 'restaurant',
      price: '18₺',
      description: 'Traditional Turkish cuisine with meat and vegetables'
    },
    {
      id: 'special',
      name: 'Special Menu',
      icon: 'star',
      price: '25₺',
      description: 'Chef\'s special with premium ingredients'
    }
  ];

  const timeSlots = [
    '11:30 - 12:00',
    '12:00 - 12:30',
    '12:30 - 13:00',
    '13:00 - 13:30',
    '13:30 - 14:00',
    '14:00 - 14:30'
  ];

  const dates = [
    { label: 'Today', value: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: 'Day After', value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ];

  const handleBackPress = () => {
    router.back();
  };

  const handleCompleteReservation = () => {
    if (!selectedType || !selectedTime || !selectedDate) {
      Alert.alert('Error', 'Please select meal type, time, and date');
      return;
    }

    const selectedTypeData = reservationTypes.find(type => type.id === selectedType);
    
    Alert.alert(
      'Confirm Reservation',
      `Meal: ${selectedTypeData?.name}\nTime: ${selectedTime}\nDate: ${dates.find(d => d.value === selectedDate)?.label}\nPrice: ${selectedTypeData?.price}`,
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
        <Text style={styles.headerTitle}>Food Reservation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#9a0f21" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cafeteria Hours</Text>
            <Text style={styles.infoText}>Monday - Friday: 11:30 AM - 9:00 PM</Text>
            <Text style={styles.infoText}>Saturday - Sunday: 12:00 PM - 8:00 PM</Text>
          </View>
        </View>

        {/* Meal Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Meal Type</Text>
          <View style={styles.typeGrid}>
            {reservationTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <MaterialIcons 
                  name={type.icon as any} 
                  size={32} 
                  color={selectedType === type.id ? '#9a0f21' : '#666'} 
                />
                <Text style={[
                  styles.typeName,
                  selectedType === type.id && styles.typeNameSelected
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.typePrice}>{type.price}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateGrid}>
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
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
        {selectedType && selectedTime && selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reservation Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Meal Type</Text>
                <Text style={styles.summaryValue}>
                  {reservationTypes.find(type => type.id === selectedType)?.name}
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
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Total Price</Text>
                <Text style={styles.summaryValueTotal}>
                  {reservationTypes.find(type => type.id === selectedType)?.price}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Complete Reservation Button */}
        <TouchableOpacity 
          style={[
            styles.reservationButton,
            (!selectedType || !selectedTime || !selectedDate) && styles.reservationButtonDisabled
          ]}
          onPress={handleCompleteReservation}
          disabled={!selectedType || !selectedTime || !selectedDate}
        >
          <MaterialIcons name="restaurant" size={20} color="#fff" />
          <Text style={styles.reservationButtonText}>Complete Reservation</Text>
        </TouchableOpacity>

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
  typeGrid: {
    gap: 12,
  },
  typeCard: {
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
  typeCardSelected: {
    borderColor: '#9a0f21',
    backgroundColor: '#f0f8ff',
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: '#9a0f21',
  },
  typePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonSelected: {
    borderColor: '#9a0f21',
    backgroundColor: '#f0f8ff',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateButtonTextSelected: {
    color: '#9a0f21',
  },
  dateButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  dateButtonSubtextSelected: {
    color: '#9a0f21',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeButtonSelected: {
    backgroundColor: '#9a0f21',
    borderColor: '#9a0f21',
  },
  timeButtonText: {
    fontSize: 14,
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
    color: '#4CAF50',
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
    backgroundColor: '#9a0f21',
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
  bottomSpacing: {
    height: 100,
  },
});

export default CafeteriaReservationScreen; 