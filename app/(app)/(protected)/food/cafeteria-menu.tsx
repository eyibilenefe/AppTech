import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MealItem {
  id: string;
  name: string;
  calories: number;
}

const dummyMealItems: MealItem[] = [
  { id: '1', name: 'Grilled Chicken Sandwich', calories: 420 },
  { id: '2', name: 'Caesar Salad', calories: 280 },
  { id: '3', name: 'French Fries', calories: 365 },
  { id: '4', name: 'Burger with Cheese', calories: 540 },
  { id: '5', name: 'Vegetable Soup', calories: 120 },
  { id: '6', name: 'Turkish Coffee', calories: 15 },
  { id: '7', name: 'Fresh Orange Juice', calories: 110 },
  { id: '8', name: 'Chocolate Cake', calories: 350 },
];

const CafeteriaMenu = () => {
  const router = useRouter();
  const totalCalories = dummyMealItems.reduce((sum, item) => sum + item.calories, 0);
  const crowdStatus = 'Moderate'; // Can be 'Busy', 'Moderate', 'Light'

  const handleBackPress = () => {
    router.back();
  };

  const handleReviewsPress = () => {
    router.push('/(app)/(protected)/food/reviews');
  };

  const getCrowdColor = (status: string) => {
    switch (status) {
      case 'Busy':
        return '#FF4757';
      case 'Moderate':
        return '#FFA726';
      case 'Light':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getCrowdIcon = (status: string) => {
    switch (status) {
      case 'Busy':
        return 'people';
      case 'Moderate':
        return 'people-outline';
      case 'Light':
        return 'person';
      default:
        return 'person';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cafeteria Menu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crowd Status */}
        <View style={styles.crowdCard}>
          <MaterialIcons 
            name={getCrowdIcon(crowdStatus)} 
            size={24} 
            color={getCrowdColor(crowdStatus)} 
          />
          <Text style={styles.crowdLabel}>Current Status:</Text>
          <Text style={[styles.crowdStatus, { color: getCrowdColor(crowdStatus) }]}>
            {crowdStatus}
          </Text>
        </View>

        {/* Menu Card */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Today's Menu</Text>
            <Text style={styles.menuDate}>
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Meal Items */}
          <View style={styles.mealItemsContainer}>
            <Text style={styles.sectionTitle}>Available Items</Text>
            {dummyMealItems.map((item) => (
              <View key={item.id} style={styles.mealItem}>
                <View style={styles.mealItemContent}>
                  <Text style={styles.mealItemName}>{item.name}</Text>
                  <Text style={styles.mealItemCalories}>{item.calories} cal</Text>
                </View>
                <View style={styles.mealItemDivider} />
              </View>
            ))}
          </View>

          {/* Total Calories */}
          <View style={styles.calorieSection}>
            <View style={styles.calorieCard}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6B35" />
              <Text style={styles.calorieText}>Total Calories</Text>
              <Text style={styles.calorieValue}>{totalCalories} cal</Text>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Cafeteria Information</Text>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.infoText}>Open Hours: 08:00 - 22:00</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>Student Center Cafeteria</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.infoText}>Fresh meals prepared daily</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="payment" size={20} color="#666" />
            <Text style={styles.infoText}>Cash & Card accepted</Text>
          </View>
        </View>

        {/* Reviews Button */}
        <TouchableOpacity style={styles.reviewsButton} onPress={handleReviewsPress}>
          <MaterialIcons name="rate-review" size={24} color="#fff" />
          <Text style={styles.reviewsButtonText}>View Reviews</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
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
  crowdCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  crowdLabel: {
    fontSize: 14,
    color: '#666',
  },
  crowdStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDate: {
    fontSize: 14,
    color: '#666',
  },
  mealItemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mealItem: {
    marginBottom: 8,
  },
  mealItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  mealItemCalories: {
    fontSize: 12,
    color: '#9a0f21',
    fontWeight: '600',
  },
  mealItemDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  calorieSection: {
    alignItems: 'center',
  },
  calorieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  calorieText: {
    fontSize: 14,
    color: '#666',
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  reviewsButton: {
    backgroundColor: '#9a0f21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  reviewsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default CafeteriaMenu; 