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
import { Meal, fetchKykMeals, fetchReviews } from '../../../api/kyk-menu-fetcher';

const KYKMenu = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'dinner'>('breakfast');
  const [scores, setScores] = useState<{ breakfast: number | null; dinner: number | null }>({
    breakfast: null,
    dinner: null,
  });

  useEffect(() => {
    const getMealsAndScores = async () => {
      try {
        setLoading(true);
        const fetchedMeals = await fetchKykMeals('izmir');
        setMeals(fetchedMeals);

        const today = new Date().toISOString().split('T')[0];

        // Fetch breakfast reviews and calculate score
        const breakfastReviews = await fetchReviews(today, 'kyk', 'sabah');
        const breakfastScore =
          breakfastReviews.length > 0
            ? breakfastReviews.reduce((sum, review) => sum + review.rating, 0) /
              breakfastReviews.length
            : null;

        // Fetch dinner reviews and calculate score
        const dinnerReviews = await fetchReviews(today, 'kyk', 'akşam');
        const dinnerScore =
          dinnerReviews.length > 0
            ? dinnerReviews.reduce((sum, review) => sum + review.rating, 0) / dinnerReviews.length
            : null;

        setScores({ breakfast: breakfastScore, dinner: dinnerScore });

        setError(null);
      } catch (e) {
        setError('Failed to fetch menu or score data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getMealsAndScores();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleReviewsPress = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    router.push({
      pathname: '/(app)/(protected)/food/reviews',
      params: {
        date: today,
        type: 'kyk',
        daytime: selectedMealType === 'breakfast' ? 'sabah' : 'akşam',
      },
    });
  };

  const breakfast = meals.find((m) => m.mealType === 'Kahvaltı');
  const dinner = meals.find((m) => m.mealType === 'Akşam Yemeği');

  const renderMealSection = (meal: Meal | undefined, title: string) => {
    if (!meal || meal.items.length === 0) {
      return (
        <View style={styles.mealItemsContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.noDataText}>Veri bulunamadı.</Text>
        </View>
      );
    }

    return (
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
    );
  };

  const renderMealToggle = () => {
    return (
      <View style={styles.mealToggleContainer}>
        <TouchableOpacity
          style={[
            styles.mealToggleButton,
            selectedMealType === 'breakfast' && styles.mealToggleButtonActive,
          ]}
          onPress={() => setSelectedMealType('breakfast')}
        >
          <MaterialIcons 
            name="free-breakfast" 
            size={20} 
            color={selectedMealType === 'breakfast' ? '#fff' : '#9a0f21'} 
          />
          <Text
            style={[
              styles.mealToggleText,
              selectedMealType === 'breakfast' && styles.mealToggleTextActive,
            ]}
          >
            Breakfast
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.mealToggleButton,
            selectedMealType === 'dinner' && styles.mealToggleButtonActive,
          ]}
          onPress={() => setSelectedMealType('dinner')}
        >
          <MaterialIcons 
            name="restaurant" 
            size={20} 
            color={selectedMealType === 'dinner' ? '#fff' : '#9a0f21'} 
          />
          <Text
            style={[
              styles.mealToggleText,
              selectedMealType === 'dinner' && styles.mealToggleTextActive,
            ]}
          >
            Dinner
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getCurrentMeal = () => {
    return selectedMealType === 'breakfast' ? breakfast : dinner;
  };

  const getCurrentMealTitle = () => {
    return selectedMealType === 'breakfast' ? 'Breakfast (Kahvaltı)' : 'Dinner (Akşam Yemeği)';
  };

  const getCurrentMealTime = () => {
    return selectedMealType === 'breakfast' 
      ? '07:30 - 10:00' 
      : '16:00 - 22:30';
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Card */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <View style={styles.menuHeaderContent}>
              <View style={styles.menuHeaderLeft}>
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
              <View style={styles.overallScoreContainer}>
                <Text style={styles.overallScoreLabel}>Overall Score</Text>
                <View style={styles.overallScoreValue}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.overallScoreText}>
                    {selectedMealType === 'breakfast'
                      ? scores.breakfast?.toFixed(1) ?? 'N/A'
                      : scores.dinner?.toFixed(1) ?? 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Meal Type Toggle */}
          {renderMealToggle()}

          {loading ? (
            <ActivityIndicator size="large" color="#9a0f21" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {renderMealSection(getCurrentMeal(), getCurrentMealTitle())}
            </>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Meal Information</Text>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.infoText}>
              Serving Time: {getCurrentMealTime()}
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
  menuHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuHeaderLeft: {
    flex: 1,
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
  overallScoreContainer: {
    alignItems: 'center',
    gap: 4,
  },
  overallScoreLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  overallScoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overallScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  mealToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  mealToggleButtonActive: {
    backgroundColor: '#9a0f21',
  },
  mealToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9a0f21',
  },
  mealToggleTextActive: {
    color: '#fff',
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
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
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