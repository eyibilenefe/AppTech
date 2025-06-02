import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
  restaurantName: string;
}

interface OrderStatus {
  stage: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  estimatedTime: string;
}

// Dummy order data
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

const OrderStatusScreen = () => {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>({
    stage: 'preparing',
    estimatedTime: '25-30 min',
  });

  // Simulate order progress
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      if (currentStatus.stage === 'confirmed') {
        setCurrentStatus({ stage: 'preparing', estimatedTime: '20-25 min' });
      } else if (currentStatus.stage === 'preparing') {
        setCurrentStatus({ stage: 'out_for_delivery', estimatedTime: '10-15 min' });
      } else if (currentStatus.stage === 'out_for_delivery') {
        setCurrentStatus({ stage: 'delivered', estimatedTime: 'Delivered!' });
      }
    }, 10000); // Change status every 10 seconds for demo

    return () => clearTimeout(progressTimer);
  }, [currentStatus.stage]);

  const handleBackPress = () => {
    router.back();
  };

  const handleCancelOrder = () => {
    if (currentStatus.stage === 'delivered') {
      Alert.alert('Order Delivered', 'This order has already been delivered and cannot be cancelled.');
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
          onPress: () => {
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
            router.back();
          },
        },
      ]
    );
  };

  const getStatusIcon = (stage: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return <MaterialIcons name="check-circle" size={24} color="#4CAF50" />;
    } else if (isActive) {
      return <MaterialIcons name="radio-button-checked" size={24} color="#007AFF" />;
    } else {
      return <MaterialIcons name="radio-button-unchecked" size={24} color="#E0E0E0" />;
    }
  };

  const getStatusText = (stage: string) => {
    switch (stage) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return '';
    }
  };

  const getStatusDescription = (stage: string) => {
    switch (stage) {
      case 'confirmed':
        return 'Your order has been received and confirmed';
      case 'preparing':
        return 'Restaurant is preparing your food';
      case 'out_for_delivery':
        return 'Your order is on its way to you';
      case 'delivered':
        return 'Your order has been delivered successfully';
      default:
        return '';
    }
  };

  const statusStages = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStageIndex = statusStages.indexOf(currentStatus.stage);

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
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID */}
        <View style={styles.orderIdCard}>
          <Text style={styles.orderIdTitle}>Order #12345</Text>
          <Text style={styles.orderIdSubtitle}>
            Estimated delivery: {currentStatus.estimatedTime}
          </Text>
        </View>

        {/* Status Progress */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Order Progress</Text>
          
          {statusStages.map((stage, index) => {
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
                        (isCompleted || isActive) && styles.statusLineActive
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
                      {currentStatus.estimatedTime}
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
              <Text style={styles.infoValue}>Dormitory Building A, Room 101</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="payment" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>Cash on Delivery</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Order Time</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Order Items</Text>
          
          {dummyOrderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.orderItemRestaurant}>{item.restaurantName}</Text>
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
            <MaterialIcons name="support-agent" size={20} color="#007AFF" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Cancel Order Button */}
      {currentStatus.stage !== 'delivered' && (
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
    marginBottom: 20,
  },
  statusIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  statusLineActive: {
    backgroundColor: '#007AFF',
  },
  statusContent: {
    flex: 1,
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
    color: '#007AFF',
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
  orderItemRestaurant: {
    fontSize: 12,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
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
    color: '#007AFF',
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
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  supportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    height: 100,
  },
});

export default OrderStatusScreen; 