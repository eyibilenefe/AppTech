import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { htmlToText } from 'html-to-text';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import StarRating from '../../../../components/StarRating';
import { supabase } from '../../../../utils/supabase';

interface MealItem {
  id: string;
  name: string;
  calories: number;
}


const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchMeals = async (date: string, isVegetarian: boolean) => {
  const mealType = isVegetarian ? 'V' : 'O';
  const apiUrl = `https://yks.iyte.edu.tr/yemekliste.aspx?tarih=${date}&ogun=${mealType}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching meal data:', error);
    throw error;
  }
};

const parseHtmlTable = (html: string): MealItem[] => {
  const text = htmlToText(html, {
    wordwrap: false,
  });

  const cleanedText = text
    .replace(/ADKALORI/g, '')
    .replace(/Nisan [^\n]*/g, '')
    .trim();

  const mealPattern = /([^\d]+)(\d+)/g;
  const mealData: MealItem[] = [];

  let match;
  while ((match = mealPattern.exec(cleanedText)) !== null) {
    const name = match[1].trim();
    const calories = match[2].trim();
    mealData.push({ id: match[0], name, calories: parseInt(calories) });
  }

  return mealData;
};

const CafeteriaMenu = () => {
  const router = useRouter();
  const crowdStatus = 'Moderate'; // Can be 'Moderate', 'Busy', 'Light'

  const [meals, setMeals] = useState<MealItem[]>([]);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [selectedDateName, setSelectedDateName] = useState<string>('Today');
  const [loading, setLoading] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState<number>(5.0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [menuAvailable, setMenuAvailable] = useState<boolean>(true);

  // Date options for selector
  const dateOptions = [
    { date: getCurrentDate(), label: 'Today' },
    { date: getDateOffset(1), label: 'Tomorrow' },
    { date: getDateOffset(2), label: 'After Tomorrow' },
  ];

  const loadMeals = async (date: string = selectedDate) => {
    setLoading(true);
    setMenuAvailable(true);
    try {
      const meals = await fetchMeals(date, false);
      const parsedMeals = parseHtmlTable(meals);
      
      // Check if menu is available (has meals)
      if (parsedMeals.length === 0) {
        setMenuAvailable(false);
        setMeals([]);
        setTotalCalories(0);
      } else {
        setMenuAvailable(true);
        setMeals(parsedMeals);
        setTotalCalories(parsedMeals.reduce((sum, item) => sum + item.calories, 0));
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      setMenuAvailable(false);
      setMeals([]);
      setTotalCalories(0);
      Alert.alert('Error', 'Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const checkUserReview = async (date: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('food_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .eq('type', 'yemekhane')
        .eq('daytime', 'öğlen')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user review:', error);
        return;
      }

      setUserReview(data);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const fetchAverageRating = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('food_reviews')
        .select('score')
        .eq('date', date)
        .eq('type', 'yemekhane')
        .eq('daytime', 'öğlen');

      if (error) {
        console.error('Error fetching ratings:', error);
        return;
      }

      if (data && data.length > 0) {
        const sum = data.reduce((acc: number, review: any) => acc + review.score, 0);
        const average = sum / data.length;
        setAverageRating(Math.round(average * 10) / 10);
      } else {
        setAverageRating(null);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const submitReview = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to submit a review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('food_reviews')
        .insert({
          user_id: userId,
          date: getCurrentDate(),
          type: 'yemekhane',
          daytime: 'öğlen',
          score: reviewScore,
          comment: reviewComment.trim() || null,
        });

      if (error) {
        console.error('Error submitting review:', error);
        Alert.alert('Error', 'Failed to submit review. Please try again.');
        return;
      }

      Alert.alert('Success', 'Your review has been submitted successfully!');
      setReviewComment('');
      await checkUserReview(getCurrentDate());
      await fetchAverageRating(getCurrentDate());
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDateChange = (date: string, label: string) => {
    setSelectedDate(date);
    setSelectedDateName(label);
    loadMeals(date);
    fetchAverageRating(date);
    if (date === getCurrentDate()) {
      checkUserReview(date);
      fetchAverageRating(date);
    } else {
      setUserReview(null);
      setAverageRating(null);
    }
  };

  useEffect(() => {
    getCurrentUser();
    loadMeals();
    fetchAverageRating(selectedDate);
  }, []);

  useEffect(() => {
    if (userId && selectedDate === getCurrentDate()) {
      checkUserReview(selectedDate);
    }
  }, [userId, selectedDate]);

  const handleBackPress = () => {
    router.back();
  };

  const handleReviewsPress = () => {
    router.push({
      pathname: '/(app)/(protected)/food/reviews',
      params: {
        date: selectedDate,
        type: 'yemekhane',
        daytime: 'öğlen',
      },
    });
  };

  // const getCrowdColor = (status: string) => {
  //   switch (status) {
  //     case 'Busy':
  //       return '#FF4757';
  //     case 'Moderate':
  //       return '#FFA726';
  //     case 'Light':
  //       return '#4CAF50';
  //     default:
  //       return '#666';
  //   }
  // };

  // const getCrowdIcon = (status: string) => {
  //   switch (status) {
  //     case 'Busy':
  //       return 'people';
  //     case 'Moderate':
  //       return 'people-outline';
  //     case 'Light':
  //       return 'person';
  //     default:
  //       return 'person';
  //   }
  // };

  const getRatingDescription = (rating: number | null): string => {
    if (rating === null) return '';
    if (rating <= 3) return 'Poor';
    if (rating <= 5) return 'Fair';
    if (rating <= 7) return 'Good';
    if (rating <= 8.5) return 'Very Good';
    return 'Excellent';
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
        {/* Date Selector */}
        <View style={styles.dateSelector}>
          {dateOptions.map((option) => (
            <TouchableOpacity
              key={option.date}
              style={[
                styles.dateTab,
                selectedDate === option.date && styles.activeDateTab,
              ]}
              onPress={() => handleDateChange(option.date, option.label)}
            >
              <Text
                style={[
                  styles.dateTabText,
                  selectedDate === option.date && styles.activeDateTabText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9a0f21" />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        )}

        {/* Crowd Status */}
        {/* {!loading && (
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
        )} */}

        {/* Menu Card */}
        {!loading && (
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderLeft}>
                <Text style={styles.menuTitle}>{selectedDateName}'s Menu</Text>
                <Text style={styles.menuDate}>
                  {new Date(selectedDate).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              {/* Average Rating Display - Only for Today */}
              {averageRating !== null && (
                <View style={styles.ratingDisplay}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{averageRating}/10</Text>
                  <Text style={styles.ratingDescription}>({getRatingDescription(averageRating)})</Text>
                </View>
              )}
            </View>

            {/* Meal Items */}
            <View style={styles.mealItemsContainer}>
              <Text style={styles.sectionTitle}>Available Items</Text>
              {!menuAvailable ? (
                <View style={styles.noMenuContainer}>
                  <MaterialIcons name="restaurant-menu" size={48} color="#ccc" />
                  <Text style={styles.noMenuTitle}>No Menu Available</Text>
                  <Text style={styles.noMenuText}>
                    The cafeteria meal will not be available {selectedDateName.toLowerCase()}.
                  </Text>
                </View>
              ) : (
                <>
                  {meals.map((item) => (
                    <View key={item.id} style={styles.mealItem}>
                      <View style={styles.mealItemContent}>
                        <Text style={styles.mealItemName}>{item.name}</Text>
                        <Text style={styles.mealItemCalories}>{item.calories} cal</Text>
                      </View>
                      <View style={styles.mealItemDivider} />
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* Total Calories - Only show if menu is available */}
            {menuAvailable && (
              <View style={styles.calorieSection}>
                <View style={styles.calorieCard}>
                  <MaterialIcons name="local-fire-department" size={24} color="#FF6B35" />
                  <Text style={styles.calorieText}>Total Calories</Text>
                  <Text style={styles.calorieValue}>{totalCalories} cal</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Review Section - Only for Today and when menu is available */}
        {!loading && selectedDate === getCurrentDate() && menuAvailable && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Rate Today's Lunch</Text>
            
            {userReview ? (
              <View style={styles.existingReview}>
                <Text style={styles.existingReviewText}>
                  You've already reviewed today's lunch
                </Text>
                <View style={styles.existingReviewScore}>
                  <StarRating rating={userReview.score} disabled size={20} />
                  <Text style={styles.existingReviewScoreText}>
                    {userReview.score.toFixed(1)}/10
                  </Text>
                </View>
                {userReview.comment && (
                  <Text style={styles.existingReviewComment}>
                    "{userReview.comment}"
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.reviewForm}>
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreLabel}>Your Score: {reviewScore.toFixed(1)}/10</Text>
                  <StarRating rating={reviewScore} setRating={setReviewScore} />
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Comment (optional):</Text>
                  <TextInput
                    style={styles.commentInput}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Share your thoughts about today's lunch..."
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="rate-review" size={20} color="#fff" />
                      <Text style={styles.submitButtonText}>Submit Review</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Additional Info */}
        {!loading && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Cafeteria Information</Text>
            <View style={styles.infoItem}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.infoText}>Open Hours: 11:30 - 14:00 in Weekdays</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>Student Center Cafeteria</Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://maps.app.goo.gl/bMkxFB1LzZdLhkKu9')}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ color: '#0066cc', fontSize: 14 }}>View on Maps</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="info" size={20} color="#666" />
              <Text style={styles.infoText}>Fresh meals prepared daily</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="payment" size={20} color="#666" />
              <Text style={styles.infoText}>Only Student ID Cards Accepted</Text>
            </View>
          </View>
        )}

        {/* Reviews Button - Only show when menu is available */}
        {!loading && menuAvailable && (
          <TouchableOpacity style={styles.reviewsButton} onPress={handleReviewsPress}>
            <MaterialIcons name="rate-review" size={24} color="#fff" />
            <Text style={styles.reviewsButtonText}>View Reviews</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

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
  dateSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  dateTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDateTab: {
    backgroundColor: '#9a0f21',
  },
  dateTabText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeDateTabText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    alignItems: 'flex-end',
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
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  existingReview: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  existingReviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  existingReviewScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  existingReviewScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  existingReviewComment: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
  },
  reviewForm: {
    marginTop: 12,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#9a0f21',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMenuContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noMenuText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CafeteriaMenu; 