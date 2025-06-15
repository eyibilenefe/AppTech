import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

interface MenuItem {
  id: string;
  name: string;
  price: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  hours: string;
  location: string;
  phone: string;
  categories: Category[];
}

const RestaurantDetail = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const { restaurantData } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [isLoved, setIsLoved] = useState(false);
  const [isLoadingLove, setIsLoadingLove] = useState(false);

  useEffect(() => {
    if (restaurantData && typeof restaurantData === 'string') {
      try {
        const parsedData = JSON.parse(restaurantData);
        setRestaurant(parsedData);
      } catch (error) {
        console.error('Error parsing restaurant data:', error);
      }
    }
  }, [restaurantData]);

  useEffect(() => {
    const checkIfLoved = async () => {
      if (!user || !restaurant) return;

      try {
        const { data, error } = await supabase
          .from('user_restaurants')
          .select('*')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurant.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking loved status:', error);
          return;
        }

        setIsLoved(!!data);
      } catch (error) {
        console.error('Error checking loved status:', error);
      }
    };

    checkIfLoved();
  }, [user, restaurant]);

  const handleBackPress = () => {
    router.back();
  };

  const handleCategoryPress = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    router.push({
      pathname: '/(app)/(protected)/food/add-to-cart',
      params: {
        itemData: JSON.stringify({
          ...item,
          restaurantName: restaurant?.name,
          restaurantId: restaurant?.id,
        }),
      },
    });
  };

  const handleLovePress = async () => {
    if (!user || !restaurant) {
      Alert.alert('Error', 'Please log in to save restaurants.');
      return;
    }

    setIsLoadingLove(true);

    try {
      if (isLoved) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_restaurants')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurant.id);

        if (error) throw error;

        setIsLoved(false);
        Alert.alert('Success', 'Restaurant removed from favorites!');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_restaurants')
          .insert({
            user_id: user.id,
            restaurant_id: restaurant.id,
          });

        if (error) throw error;

        setIsLoved(true);
        Alert.alert('Success', 'Restaurant added to favorites!');
      }
    } catch (error: any) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', error.message || 'Failed to update favorite status.');
    } finally {
      setIsLoadingLove(false);
    }
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading restaurant details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <TouchableOpacity onPress={handleLovePress} disabled={isLoadingLove}>
          {isLoadingLove ? (
            <ActivityIndicator size="small" color="#9a0f21" />
          ) : (
            <MaterialIcons 
              name={isLoved ? "favorite" : "favorite-border"} 
              size={24} 
              color={isLoved ? "#9a0f21" : "#666"} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.infoText}>Working Hours: {restaurant.hours}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>{restaurant.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <Text style={styles.infoText}>{restaurant.phone}</Text>
          </View>
        </View>

        {/* Menu Categories */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Menu</Text>
          
          {restaurant.categories.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
                <MaterialIcons
                  name={expandedCategories[category.id] ? "expand-less" : "expand-more"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedCategories[category.id] && (
                <View style={styles.menuItems}>
                  {category.items.map((item) => (
                    <View key={item.id} style={styles.menuItem}>
                      <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemPrice}>{item.price}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddToCart(item)}
                      >
                        <MaterialIcons name="add-shopping-cart" size={24} color="#9a0f21" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.floatingCartButton}
        onPress={() => router.push('/(app)/(protected)/food/cart')}
      >
        <MaterialIcons name="shopping-cart" size={24} color="#fff" />
        <Text style={styles.cartButtonText}>Cart</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
    textAlign: 'center',
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
  restaurantInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuItems: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  addToCartButton: {
    padding: 8,
    marginLeft: 12,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: '#9a0f21',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 120,
  },
});

export default RestaurantDetail; 