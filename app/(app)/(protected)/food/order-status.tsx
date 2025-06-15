import { supabase } from '@/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

interface Address {
  location: string;
  description?: string | null;
}

interface PaymentMethod {
  name: string;
}

interface Restaurant {
  name: string;
}

interface Order {
  id: string;
  order_time: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  addresses: Address | null;
  payment_methods: PaymentMethod | null;
  restaurants: Restaurant | null;
}


// Dummy order data - NOTE: Replace with actual data once order_items are saved to DB.
const dummyOrderItems: OrderItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken',
    price: '35₺',
    quantity: 2,
  },
  {
    id: '2',
    name: 'Turkish Tea',
    price: '5₺',
    quantity: 1,
  },
];

const OrderStatusScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems] = useState<OrderItem[]>(dummyOrderItems);


  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          order_time,
          status,
          addresses (*),
          payment_methods (*),
          restaurants (name)
        `)
        .eq('id', orderId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setOrder(data as unknown as Order);
      }

    } catch (err: any) {
      console.error('Failed to fetch order status:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      fetchOrderDetails();
    }, [fetchOrderDetails])
  );

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-updates-${orderId}`)
      .on<Order>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            setOrder((prevOrder) => {
              if (prevOrder) {
                return { ...prevOrder, status: payload.new.status };
              }
              return null;
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);


  const handleBackPress = () => {
    router.back();
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (order.status !== 'pending') {
      Alert.alert('Cannot Cancel', 'This order is already being processed and cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);

              if (updateError) throw updateError;
              
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
              router.back();

            } catch (err: any) {
              Alert.alert('Error', 'Failed to cancel the order.');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (stage: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return <MaterialIcons name="check-circle" size={24} color="#4CAF50" />;
    } else if (isActive) {
      return <MaterialIcons name="radio-button-checked" size={24} color="#9a0f21" />;
    } else {
      return <MaterialIcons name="radio-button-unchecked" size={24} color="#E0E0E0" />;
    }
  };

  const getStatusText = (stage: string) => {
    switch (stage) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Order Cancelled';
      default: return '';
    }
  };

  const getStatusDescription = (stage: string) => {
    switch (stage) {
      case 'pending': return 'Waiting for the restaurant to confirm your order';
      case 'confirmed': return 'Your order has been received and confirmed';
      case 'preparing': return 'Restaurant is preparing your food';
      case 'out_for_delivery': return 'Your order is on its way to you';
      case 'delivered': return 'Your order has been delivered successfully';
      case 'cancelled': return 'This order has been cancelled';
      default: return '';
    }
  };

  const getEstimatedTime = (stage: string) => {
    switch (stage) {
      case 'pending': return 'Awaiting confirmation...';
      case 'confirmed': return 'Est. 30-35 min';
      case 'preparing': return 'Est. 20-25 min';
      case 'out_for_delivery': return 'Est. 10-15 min';
      case 'delivered': return 'Delivered!';
      case 'cancelled': return 'Cancelled';
      default: return 'N/A';
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading Order Status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error || 'Could not load order details.'}</Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
             <Text style={styles.backButtonText}>Go Back to Food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStages = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStageIndex = statusStages.indexOf(order.status);

  const calculateItemTotal = (item: OrderItem) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
    return price * item.quantity;
  };

  const itemsTotal = orderItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  const serviceFee = 5;
  const grandTotal = itemsTotal + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID */}
        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdTitle}>Order #{order.id.substring(0, 8)}</Text>
          <Text style={styles.orderIdSubtitle}>
            Estimated delivery: {getEstimatedTime(order.status)}
          </Text>
          {order.restaurants && <Text style={styles.restaurantName}>{order.restaurants.name}</Text>}
        </View>

        {/* Status Progress */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Order Progress</Text>
          
          {order.status === 'cancelled' ? (
            <View style={styles.statusItem}>
                <View style={styles.statusIndicator}>
                  <MaterialIcons name="cancel" size={24} color="#FF4757" />
                </View>
                <View style={styles.statusContent}>
                  <Text style={[styles.statusText, styles.statusTextActive]}>
                    Order Cancelled
                  </Text>
                  <Text style={styles.statusDescription}>
                    This order was cancelled.
                  </Text>
                </View>
              </View>
          ) : statusStages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            
            return (
              <View key={stage} style={styles.statusItem}>
                <View style={styles.statusIndicator}>
                  {getStatusIcon(stage, isActive, isCompleted)}
                  {index < statusStages.length - 1 && (
                    <View 
                      style={[
                        styles.statusLine, 
                        isCompleted && styles.statusLineActive
                      ]} 
                    />
                  )}
                </View>
                
                <View style={styles.statusContent}>
                  <Text style={[
                    styles.statusText,
                    (isActive || isCompleted) && styles.statusTextActive
                  ]}>
                    {getStatusText(stage)}
                  </Text>
                  <Text style={styles.statusDescription}>
                    {getStatusDescription(stage)}
                  </Text>
                  {isActive && (
                    <Text style={styles.statusTime}>
                      {getEstimatedTime(stage)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Delivery Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue}>{order.addresses?.location || 'Not available'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="payment" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>{order.payment_methods?.name || 'Not available'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Order Time</Text>
              <Text style={styles.infoValue}>
                {new Date(order.order_time).toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Order Items (Sample)</Text>
          
          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>
                  {item.quantity}x {item.name}
                </Text>
              </View>
              <Text style={styles.orderItemPrice}>
                {calculateItemTotal(item).toFixed(0)}₺
              </Text>
            </View>
          ))}

          <View style={styles.itemsDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>{grandTotal.toFixed(0)}₺</Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any issues with your order, please contact our support team.
          </Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <MaterialIcons name="support-agent" size={20} color="#9a0f21" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Cancel Order Button */}
      {order.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <MaterialIcons name="cancel" size={20} color="#FF4757" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#9a0f21',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderIdCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  orderIdTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderIdSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9a0f21'
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  statusLineActive: {
    backgroundColor: '#4CAF50',
  },
  statusContent: {
    flex: 1,
    paddingBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  statusTextActive: {
    color: '#333',
  },
  statusDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  itemsDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#9a0f21',
    borderRadius: 8,
    gap: 8,
  },
  supportButtonText: {
    color: '#9a0f21',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 40,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#FF4757',
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default OrderStatusScreen; 