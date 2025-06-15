import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  calories?: number | null;
}

interface Category {
  id:string;
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

interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  action?: string;
}

interface ActiveOrder {
  id: string;
}

const { width } = Dimensions.get('window');

const announcementVisuals = [
  { backgroundColor: '#FF6B35', icon: 'restaurant-menu' as const },
  { backgroundColor: '#9a0f21', icon: 'access-time' as const },
  { backgroundColor: '#4CAF50', icon: 'payment' as const },
  { backgroundColor: '#2196F3', icon: 'info' as const },
  { backgroundColor: '#E91E63', icon: 'new-releases' as const },
];

const FoodHomeScreen = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const [selectedToggle, setSelectedToggle] = useState<'KYK' | 'Cafeteria'>('Cafeteria');
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [errorRestaurants, setErrorRestaurants] = useState<string | null>(null);

  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // Don't show individual loaders on pull-to-refresh
    if (!refreshing) {
      setLoadingAnnouncements(true);
      setLoadingRestaurants(true);
      setLoadingActiveOrder(true);
    }
    setErrorAnnouncements(null);
    setErrorRestaurants(null);

    const today = new Date().toISOString().split('T')[0];
    
    const announcementsPromise = supabase
      .from('announcements')
      .select('*, restaurants(name)')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('posted_at', { ascending: false });

    const restaurantsPromise = supabase
      .from('restaurants')
      .select(`
        id, name, open_time, close_time, location, tel_no,
        restaurant_categories (categories (id, name)),
        menu_items (id, name, price, description, calories, category_id)
      `);

    const activeOrderPromise = user
      ? supabase
          .from('orders')
          .select('id')
          .not('status', 'in', '(delivered,cancelled)')
          .eq('user_id', user.id)
          .order('order_time', { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null, error: null });

    console.log('activeOrderPromise', activeOrderPromise);

    try {
      const [announcementsResult, restaurantsResult, activeOrderResult] = await Promise.all([
        announcementsPromise,
        restaurantsPromise,
        activeOrderPromise,
      ]);

      if (announcementsResult.error) throw announcementsResult.error;
      const formattedAnnouncements = announcementsResult.data.map((item, index) => {
        const visual = announcementVisuals[index % announcementVisuals.length];
        return {
          id: item.id,
          title: item.title,
          subtitle: (item as any).restaurants?.name || 'Campus Announcement',
          description: item.content,
          backgroundColor: visual.backgroundColor,
          icon: visual.icon,
        };
      });
      setAnnouncements(formattedAnnouncements);

      if (restaurantsResult.error) throw restaurantsResult.error;
      if (restaurantsResult.data) {
        const formattedRestaurants: Restaurant[] = restaurantsResult.data.map((r: any) => {
          const categories = r.restaurant_categories.map((rc: any) => {
            const category = rc.categories;
            const menuItems = r.menu_items
              .filter((item: any) => item.category_id === category.id)
              .map((item: any) => ({
                id: item.id,
                name: item.name,
                price: `${item.price}₺`,
                description: item.description,
                calories: item.calories,
              }));
            return { id: category.id, name: category.name, items: menuItems };
          });
          return {
            id: r.id,
            name: r.name,
            hours: `${String(r.open_time).slice(0, 5)} - ${String(r.close_time).slice(0, 5)}`,
            location: r.location,
            phone: r.tel_no,
            categories: categories,
          };
        });
        setRestaurants(formattedRestaurants);
      }
      
      if (activeOrderResult.error && activeOrderResult.error.code !== 'PGRST116') {
        throw activeOrderResult.error;
      }
      setActiveOrder(activeOrderResult.data as ActiveOrder | null);

    } catch (err: any) {
      setErrorAnnouncements(err.message || 'Failed to fetch data.');
      setErrorRestaurants(err.message || 'Failed to fetch data.');
      console.error('Error fetching data:', err);
    } finally {
      if (!refreshing) {
        setLoadingAnnouncements(false);
        setLoadingRestaurants(false);
        setLoadingActiveOrder(false);
      }
    }
  }, [user, refreshing]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  useEffect(() => {
    if (refreshing) {
      loadData().finally(() => setRefreshing(false));
    }
  }, [refreshing, loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRestaurantPress = (restaurantId: string) => {
    setExpandedRestaurant(expandedRestaurant === restaurantId ? null : restaurantId);
  };

  const handleCategoryPress = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleKYKPress = () => {
    router.push('/(app)/(protected)/food/kyk-menu');
  };

  const handleCafeteriaPress = () => {
    router.push('/(app)/(protected)/food/cafeteria-menu');
  };

  const handleRestaurantDetailPress = (restaurant: Restaurant) => {
    router.push({
      pathname: '/(app)/(protected)/food/restaurant',
      params: { restaurantData: JSON.stringify(restaurant) }
    });
  };

  const handleAddToCart = (item: any, restaurantName: string, restaurantId: string) => {
    router.push({
      pathname: '/(app)/(protected)/food/add-to-cart',
      params: { 
        itemData: JSON.stringify({ ...item, restaurantName, restaurantId })
      }
    });
  };

  const renderAnnouncementCard = ({ item }: { item: Announcement }) => (
    <View style={[styles.announcementCard, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.announcementContent}>
        <View style={styles.announcementHeader}>
          <MaterialIcons name={item.icon} size={32} color="#fff" />
          <View style={styles.announcementBadge}>
            <Text style={styles.announcementSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementDescription}>{item.description}</Text>
        {item.action && (
          <TouchableOpacity style={styles.announcementAction}>
            <Text style={styles.announcementActionText}>{item.action}</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRestaurant = ({ item: restaurant }: { item: Restaurant }) => {
    const isExpanded = expandedRestaurant === restaurant.id;

    return (
      <View style={styles.restaurantCard}>
        <TouchableOpacity
          style={styles.restaurantHeader}
          onPress={() => handleRestaurantPress(restaurant.id)}
        >
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantHours}>{restaurant.hours}</Text>
          </View>
          <View style={styles.restaurantActions}>
            <TouchableOpacity onPress={() => handleRestaurantDetailPress(restaurant)}>
              <MaterialIcons name="directions" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRestaurantPress(restaurant.id)}>
              <MaterialIcons 
                name={isExpanded ? "expand-less" : "expand-more"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.descriptionArea}>
            <Text style={styles.descriptionTitle}>Menu Categories</Text>
            {restaurant.categories.map((category) => (
              <View key={category.id} style={styles.categoryContainer}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <MaterialIcons
                    name={expandedCategories[category.id] ? "expand-less" : "expand-more"}
                    size={20}
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
                          onPress={() => handleAddToCart(item, restaurant.name, restaurant.id)}
                        >
                          <MaterialIcons name="add-shopping-cart" size={20} color="#9a0f21" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text></Text>
        <Text style={styles.headerTitle}>Food & Dining</Text>
        <Text></Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Announcements Section */}
        <View style={styles.announcementsSection}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          {loadingAnnouncements ? (
            <ActivityIndicator size="large" color="#9a0f21" style={{ marginTop: 20 }} />
          ) : errorAnnouncements ? (
            <Text style={styles.errorText}>{errorAnnouncements}</Text>
          ) : announcements.length === 0 ? (
            <Text style={styles.noItemsText}>No announcements right now.</Text>
          ) : (
            <FlatList
              data={announcements}
              renderItem={renderAnnouncementCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - 48}
              decelerationRate="fast"
              contentContainerStyle={styles.announcementsList}
            />
          )}
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                
              ]}
              onPress={handleKYKPress}
            >
              <MaterialIcons name="restaurant" size={24} color={selectedToggle === 'KYK' ? '#fff' : '#666'} />
              <Text
                style={[
                  styles.toggleText,
                  selectedToggle === 'KYK' && styles.activeToggleText,
                ]}
              >
                KYK Menu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
              ]}
              onPress={handleCafeteriaPress}
            >
              <MaterialIcons name="local-cafe" size={24} color="#666" />
              <Text
                style={[
                  styles.toggleText,
                  {color: '#666'},
                ]}
              >
                Cafeteria
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurants List */}
        <View style={styles.restaurantsSection}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
          {loadingRestaurants ? (
            <ActivityIndicator size="large" color="#9a0f21" style={{ marginTop: 20 }} />
          ) : errorRestaurants ? (
            <Text style={styles.errorText}>{errorRestaurants}</Text>
          ) : (
            <FlatList
              data={restaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Cart Button */}
      {loadingActiveOrder ? (
        <View style={styles.floatingCartButton}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : activeOrder ? (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => router.push({
            pathname: '/(app)/(protected)/food/order-status',
            params: { orderId: activeOrder.id }
          })}
        >
          <MaterialIcons name="track-changes" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>Track Order</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => router.push('/(app)/(protected)/food/cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>Cart</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  announcementsSection: {
    marginTop: 16,
    marginBottom: 24,
    minHeight: 150,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  announcementsList: {
    paddingHorizontal: 12,
  },
  announcementCard: {
    width: width - 48,
    borderRadius: 16,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  announcementContent: {
    padding: 20,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementSubtitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  announcementTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  announcementDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  announcementAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginTop: 20,
    marginHorizontal: 16,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeToggleButton: {
    backgroundColor: '#9a0f21',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  dateSection: {
    marginBottom: 24,
  },
  dateContainer: {
    paddingHorizontal: 16,
  },
  dateCard: {
    padding: 12,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeDateCard: {
    backgroundColor: '#9a0f21',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeDateText: {
    color: '#fff',
    fontWeight: '600',
  },
  restaurantsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  restaurantHours: {
    fontSize: 14,
    color: '#666',
  },
  restaurantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descriptionArea: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  menuItems: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 14,
    marginBottom: 2,
    color: '#333',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  addToCartButton: {
    padding: 8,
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

export default FoodHomeScreen;