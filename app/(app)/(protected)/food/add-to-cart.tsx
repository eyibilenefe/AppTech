import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CartItem {
  id: string;
  name: string;
  price: string;
  restaurantName: string;
  quantity: number;
}

const AddToCart = () => {
  const router = useRouter();
  const { itemData } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (itemData && typeof itemData === 'string') {
      try {
        const parsedData = JSON.parse(itemData);
        setItem(parsedData);
      } catch (error) {
        console.error('Error parsing item data:', error);
      }
    }
  }, [itemData]);

  const handleBackPress = () => {
    router.back();
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!item) return;

    // In a real app, you would save this to a cart context or state management
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantName: item.restaurantName || 'Unknown Restaurant',
      quantity: quantity,
    };

    // For demo purposes, we'll just show an alert
    Alert.alert(
      'Added to Cart!',
      `${quantity}x ${item.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => router.back(),
        },
        {
          text: 'View Cart',
          onPress: () => router.push('/(app)/(protected)/food/cart'),
        },
      ]
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract numeric price for calculations
  const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
  const totalPrice = (numericPrice * quantity).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Item Info */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <MaterialIcons name="restaurant-menu" size={48} color="#9a0f21" />
          </View>
          
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
          
          <Text style={styles.itemDescription}>
            Fresh and delicious meal prepared with quality ingredients. 
            Perfect for a satisfying dining experience.
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityCard}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
              onPress={decrementQuantity}
              disabled={quantity === 1}
            >
              <MaterialIcons 
                name="remove" 
                size={24} 
                color={quantity === 1 ? "#ccc" : "#9a0f21"} 
              />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <MaterialIcons name="add" size={24} color="#9a0f21" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Price:</Text>
            <Text style={styles.summaryValue}>{item.price}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity:</Text>
            <Text style={styles.summaryValue}>{quantity}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{totalPrice}₺</Text>
          </View>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <MaterialIcons name="add-shopping-cart" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add to Cart - {totalPrice}₺</Text>
        </TouchableOpacity>

        {/* Additional Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="note-add" size={20} color="#666" />
            <Text style={styles.optionText}>Add special instructions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="favorite-border" size={20} color="#666" />
            <Text style={styles.optionText}>Add to favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  itemHeader: {
    marginBottom: 16,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9a0f21',
    marginBottom: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quantityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantityDisplay: {
    minWidth: 60,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    color: '#9a0f21',
  },
  addButton: {
    backgroundColor: '#9a0f21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default AddToCart; 