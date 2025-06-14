import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Meal, fetchKykMeals } from '../../../api/kyk-menu-fetcher';

const KYKMenu = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMeals = async () => {
      try {
        setLoading(true);
        const fetchedMeals = await fetchKykMeals();
        setMeals(fetchedMeals);
        setError(null);
      } catch (e) {
        setError('Failed to fetch menu data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getMeals();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleReviewsPress = () => {
    router.push('/(app)/(protected)/food/reviews');
  };

  const breakfast = meals.find((m) => m.mealType === 'Kahvaltı');
  const dinner = meals.find((m) => m.mealType === 'Akşam Yemeği');

  const renderMealSection = (meal: Meal | undefined, title: string) => {
    if (!meal || meal.items.length === 0) {
      return (
        <View style={styles.mealItemsContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text>Veri bulunamadı.</Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.mealItemsContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {meal.items.map((item: string, index: number) => (
            <View key={index} style={styles.mealItem}>
              <View style={styles.mealItemContent}>
                <Text style={styles.mealItemName}>{item}</Text>
              </View>
              <View style={styles.mealItemDivider} />
            </View>
          ))}
        </View>
        {meal.calories && (
          <View style={styles.calorieSection}>
            <View style={styles.calorieCard}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6B35" />
              <Text style={styles.calorieText}>Calorie Range</Text>
              <Text style={styles.calorieValue}>{meal.calories}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYK Menu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

          {loading ? (
            <ActivityIndicator size="large" color="#9a0f21" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {renderMealSection(breakfast, 'Breakfast (Kahvaltı)')}
              <View style={{height: 20}}/>
              {renderMealSection(dinner, 'Dinner (Akşam Yemeği)')}
            </>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Meal Information</Text>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.infoText}>
              Serving Time: 07:30 - 10:00 (Breakfast), 16:00 - 22:30 (Dinner)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>KYK Dining Hall</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.infoText}>Nutritious and balanced meal</Text>
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
    marginBottom: 20,
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default KYKMenu; 