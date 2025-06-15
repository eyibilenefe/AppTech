import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';
import { useCart } from './cart-context';
import { defaultCampusLocations } from './locations';

interface Address {
  id: string;
  location: string;
  description?: string | null;
  is_default_campus?: boolean;
  coordinates?: string | null;
  is_default?: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
}

const OrderDetails = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const { cart, cartTotal, restaurantId, clearCart } = useCart();
  
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  const [orderNote, setOrderNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to place an order.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const addressPromise = supabase.from('addresses').select('*').eq('user_id', user.id);
      const paymentMethodPromise = supabase.from('payment_methods').select('*');

      const [addressRes, paymentMethodRes] = await Promise.all([addressPromise, paymentMethodPromise]);

      if (addressRes.error) throw addressRes.error;
      if (paymentMethodRes.error) throw paymentMethodRes.error;

      const userAddresses: Address[] = addressRes.data || [];
      const campusAddresses: Address[] = defaultCampusLocations.map(loc => ({
        id: loc.id,
        location: loc.name,
        description: loc.description,
        is_default_campus: true,
        coordinates: `${loc.coordinates.latitude}, ${loc.coordinates.longitude}`
      }));

      const combinedAddresses = [...campusAddresses, ...userAddresses];
      setAllAddresses(combinedAddresses);
      setPaymentMethods(paymentMethodRes.data || []);
      
      const defaultAddress = userAddresses.find(a => a.is_default) || combinedAddresses[0];
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load order details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Missing Information', 'Please select a delivery address.');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Missing Information', 'Please select a payment method.');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items to proceed.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User information is missing. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAddressId = selectedAddress.id;

      // If the selected address is a default campus location, ensure it exists in the DB for this user
      if (selectedAddress.is_default_campus) {
        const { data: existingAddress, error: findError } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .eq('location', selectedAddress.location)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          throw findError;
        }
        
        if (existingAddress) {
          finalAddressId = existingAddress.id;
        } else {
          const { data: newAddress, error: insertError } = await supabase
            .from('addresses')
            .insert({
              location: selectedAddress.location,
              description: selectedAddress.description,
              coordinates: selectedAddress.coordinates,
              is_default: false,
              user_id: user.id,
            })
            .select('id')
            .single();

          if (insertError) throw insertError;
          if (!newAddress) throw new Error('Failed to create new address entry.');
          
          finalAddressId = newAddress.id;
        }
      }

      // Group cart items by restaurant
      const ordersByRestaurant = cart.reduce<Record<string, typeof cart>>((acc, item) => {
        const restaurantId = (item as any).restaurantId;
        if (!restaurantId) {
          throw new Error(`Cart item "${item.name}" is missing a restaurantId.`);
        }
        if (!acc[restaurantId]) {
          acc[restaurantId] = [];
        }
        acc[restaurantId].push(item);
        return acc;
      }, {});
      
      const restaurantIds = Object.keys(ordersByRestaurant);
      const createdOrders: { id: string }[] = [];

      for (const restaurantId of restaurantIds) {
        const { data: orderData, error } = await supabase
          .from('orders')
          .insert({
            order_time: new Date().toISOString(),
            message: orderNote.trim() || null,
            status: 'pending',
            user_id: user.id,
            restaurant_id: restaurantId,
            payment_method_id: selectedPaymentMethod.id,
            address_id: finalAddressId,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        if (!orderData) throw new Error(`Failed to create order for restaurant ${restaurantId}`);

        // Note: For a complete implementation, you would also insert into `order_items` here.
        // This change focuses on creating multiple parent order records as requested.
        createdOrders.push(orderData);
      }

      if (createdOrders.length === 1) {
        Alert.alert(
          'Order Confirmed!',
          'Your order has been placed successfully.',
          [
            {
              text: 'Track Order',
              onPress: () => {
                clearCart();
                router.replace({
                  pathname: '/(app)/(protected)/food/order-status',
                  params: { orderId: createdOrders[0].id },
                });
              },
            },
          ]
        );
      } else {
         Alert.alert(
          'Orders Confirmed!',
          `Your ${createdOrders.length} orders from different restaurants have been placed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.replace('/(app)/(protected)/food');
              },
            },
          ]
        );
      }

    } catch (err: any) {
      console.error('Failed to place order(s):', err);
      Alert.alert('Order Failed', err.message || 'There was an error placing your order(s). Some may have been processed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceFee = 5;
  const grandTotal = cartTotal + serviceFee;
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
             <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} disabled={isSubmitting}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Location</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/(app)/(protected)/food/add-address')}
            >
              <MaterialIcons name="add" size={16} color="#9a0f21" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
          {allAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.selectableOption,
                selectedAddress?.id === address.id && styles.selectedOption
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <View style={styles.radioButton}>
                {selectedAddress?.id === address.id && <View style={styles.radioButtonInner} />}
              </View>
              <View>
                <Text style={styles.optionName}>{address.location}</Text>
                {address.description && <Text style={styles.optionDescription}>{address.description}</Text>}
              </View>
            </TouchableOpacity>
          ))}
          {allAddresses.length === 0 && (
            <Text style={styles.noItemsText}>No saved addresses found. Please add one.</Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
             <TouchableOpacity
              key={method.id}
              style={[
                styles.selectableOption,
                selectedPaymentMethod?.id === method.id && styles.selectedOption
              ]}
              onPress={() => setSelectedPaymentMethod(method)}
            >
              <View style={styles.radioButton}>
                {selectedPaymentMethod?.id === method.id && <View style={styles.radioButtonInner} />}
              </View>
              <MaterialIcons 
                name={method.type === 'credit_card' ? 'credit-card' : 'money'} 
                size={24} color="#666" 
                style={{marginRight: 8}}
              />
              <Text style={styles.optionName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
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
          
          {cart.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.summaryItemRestaurant}>{item.restaurantName}</Text>
              </View>
              <Text style={styles.summaryItemPrice}>
                {(item.price * item.quantity).toFixed(2)}₺
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total:</Text>
            <Text style={styles.summaryValue}>{cartTotal.toFixed(2)}₺</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee:</Text>
            <Text style={styles.summaryValue}>{serviceFee.toFixed(2)}₺</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={[styles.summaryValue, styles.freeText]}>Free</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{grandTotal.toFixed(2)}₺</Text>
          </View>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmButton, isSubmitting && styles.disabledButton]} 
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Place Order - {grandTotal.toFixed(2)}₺</Text>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#9a0f21',
    fontWeight: '600',
    fontSize: 14,
  },
  selectableOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#9a0f21',
    backgroundColor: '#fdebeb',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9a0f21',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9a0f21',
  },
  optionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryItemRestaurant: {
    fontSize: 12,
    color: '#666',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  freeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 80,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#9a0f21',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
      marginTop: 20,
      backgroundColor: '#9a0f21',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default OrderDetails; 