import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  restaurantName: string;
}

// Dummy order items
const dummyOrderItems: OrderItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken',
    price: '35₺',
    quantity: 2,
    restaurantName: 'Campus Cafeteria',
  },
  {
    id: '2',
    name: 'Turkish Tea',
    price: '5₺',
    quantity: 1,
    restaurantName: 'Campus Cafeteria',
  },
  {
    id: '3',
    name: 'Kebab',
    price: '45₺',
    quantity: 1,
    restaurantName: 'Student Restaurant',
  },
];

const deliveryLocations = [
  'Dormitory Building A',
  'Dormitory Building B',
  'Dormitory Building C',
  'Engineering Faculty',
  'Library',
  'Student Center',
  'Sports Complex',
  'Other (specify below)',
];

const OrderDetails = () => {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleConfirmOrder = () => {
    if (!selectedLocation) {
      Alert.alert('Missing Information', 'Please select a delivery location.');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Missing Information', 'Please select a payment method.');
      return;
    }

    if (selectedLocation === 'Other (specify below)' && !customLocation.trim()) {
      Alert.alert('Missing Information', 'Please specify your custom delivery location.');
      return;
    }

    // In a real app, you would process the order here
    Alert.alert(
      'Order Confirmed!',
      'Your order has been confirmed and is being prepared.',
      [
        {
          text: 'Track Order',
          onPress: () => router.push('/(app)/(protected)/food/order-status'),
        },
      ]
    );
  };

  const calculateItemTotal = (item: OrderItem) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
    return price * item.quantity;
  };

  const itemsTotal = dummyOrderItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  const serviceFee = 5;
  const grandTotal = itemsTotal + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          >
            <Text style={[styles.dropdownText, !selectedLocation && styles.placeholderText]}>
              {selectedLocation || 'Select delivery location'}
            </Text>
            <MaterialIcons 
              name={isLocationDropdownOpen ? "expand-less" : "expand-more"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>

          {isLocationDropdownOpen && (
            <View style={styles.dropdownList}>
              {deliveryLocations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedLocation(location);
                    setIsLocationDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{location}</Text>
                  {selectedLocation === location && (
                    <MaterialIcons name="check" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedLocation === 'Other (specify below)' && (
            <TextInput
              style={styles.textInput}
              placeholder="Enter your specific location..."
              value={customLocation}
              onChangeText={setCustomLocation}
              multiline
            />
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'Cash' && styles.selectedPaymentOption]}
            onPress={() => setPaymentMethod('Cash')}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'Cash' && <View style={styles.radioButtonInner} />}
            </View>
            <MaterialIcons name="money" size={24} color="#666" />
            <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'Credit Card' && styles.selectedPaymentOption]}
            onPress={() => setPaymentMethod('Credit Card')}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'Credit Card' && <View style={styles.radioButtonInner} />}
            </View>
            <MaterialIcons name="credit-card" size={24} color="#666" />
            <Text style={styles.paymentOptionText}>Credit Card</Text>
          </TouchableOpacity>
        </View>

        {/* Order Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.textAreaInput}
            placeholder="Any special instructions for your order..."
            value={orderNote}
            onChangeText={setOrderNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          {dummyOrderItems.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.summaryItemRestaurant}>{item.restaurantName}</Text>
              </View>
              <Text style={styles.summaryItemPrice}>
                {calculateItemTotal(item).toFixed(0)}₺
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total:</Text>
            <Text style={styles.summaryValue}>{itemsTotal.toFixed(0)}₺</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee:</Text>
            <Text style={styles.summaryValue}>{serviceFee}₺</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={[styles.summaryValue, styles.freeText]}>Free</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{grandTotal.toFixed(0)}₺</Text>
          </View>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
          <MaterialIcons name="check-circle" size={24} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirm Order - {grandTotal.toFixed(0)}₺</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  selectedPaymentOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    minHeight: 80,
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  summaryItemRestaurant: {
    fontSize: 12,
    color: '#666',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
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
    color: '#333',
  },
  freeText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default OrderDetails; 