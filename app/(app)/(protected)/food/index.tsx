import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Restaurant {
  id: string;
  name: string;
  hours: string;
  location: string;
  phone: string;
  categories: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      price: string;
    }>;
  }>;
}

interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
  icon: string;
  action?: string;
}

const { width } = Dimensions.get('window');

const dummyAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Special Lunch Menu',
    subtitle: 'Today Only!',
    description: 'Try our new Mediterranean dishes with 20% discount',
    backgroundColor: '#FF6B35',
    icon: 'restaurant-menu',
    action: 'View Menu',
  },
  {
    id: '2',
    title: 'Extended Hours',
    subtitle: 'Weekend Special',
    description: 'Campus Cafeteria now open until midnight on weekends',
    backgroundColor: '#9a0f21',
    icon: 'access-time',
  },
  {
    id: '3',
    title: 'New Payment Method',
    subtitle: 'Coming Soon',
    description: 'Student card payments will be available next week',
    backgroundColor: '#4CAF50',
    icon: 'payment',
  },
];

const dummyRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Campus Cafeteria',
    hours: '07:00 - 22:00',
    location: 'Main Building',
    phone: '+90 555 123 4567',
    categories: [
      {
        id: '1',
        name: 'Main Dishes',
        items: [
          { id: '1', name: 'Grilled Chicken', price: '35₺' },
          { id: '2', name: 'Pasta Alfredo', price: '28₺' },
          { id: '3', name: 'Fish & Chips', price: '42₺' },
        ],
      },
      {
        id: '2',
        name: 'Beverages',
        items: [
          { id: '4', name: 'Turkish Tea', price: '5₺' },
          { id: '5', name: 'Coffee', price: '12₺' },
          { id: '6', name: 'Fresh Juice', price: '15₺' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Student Restaurant',
    hours: '08:00 - 20:00',
    location: 'Dormitory Area',
    phone: '+90 555 987 6543',
    categories: [
      {
        id: '3',
        name: 'Traditional',
        items: [
          { id: '7', name: 'Kebab', price: '45₺' },
          { id: '8', name: 'Pide', price: '25₺' },
        ],
      },
    ],
  },
];

const FoodHomeScreen = () => {
  const router = useRouter();
  const [selectedToggle, setSelectedToggle] = useState<'KYK' | 'Cafeteria'>('Cafeteria');
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});


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

  const handleAddToCart = (item: any, restaurantName: string) => {
    router.push({
      pathname: '/(app)/(protected)/food/add-to-cart',
      params: { 
        itemData: JSON.stringify({ ...item, restaurantName })
      }
    });
  };

  const renderAnnouncementCard = ({ item }: { item: Announcement }) => (
    <View style={[styles.announcementCard, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.announcementContent}>
        <View style={styles.announcementHeader}>
          <MaterialIcons name={item.icon as any} size={32} color="#fff" />
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
              <MaterialIcons name="location-on" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="phone" size={20} color="#666" />
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
                          onPress={() => handleAddToCart(item, restaurant.name)}
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
        <TouchableOpacity>
          <MaterialIcons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food & Dining</Text>
        <TouchableOpacity>
          <MaterialIcons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Announcements Section */}
        <View style={styles.announcementsSection}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          <FlatList
            data={dummyAnnouncements}
            renderItem={renderAnnouncementCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 48}
            decelerationRate="fast"
            contentContainerStyle={styles.announcementsList}
          />
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
          <FlatList
            data={dummyRestaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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