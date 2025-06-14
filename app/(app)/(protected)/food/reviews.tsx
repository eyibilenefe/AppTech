import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/utils/supabase';

interface Review {
  id: string;
  score: number;
  comment: string;
  user_id?: string;
  date?: string;
  type?: 'kyk' | 'yemekhane';
  daytime?: 'sabah' | 'öğlen' | 'akşam';
  users: { name: string } | null;
}

const Reviews = () => {
  const router = useRouter();
  const { user } = useSupabase();
  const {
    type,
    date,
    daytime,
  }: { type: 'kyk' | 'yemekhane'; date: string; daytime: 'sabah' | 'öğlen' | 'akşam' } =
    useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [otherReviews, setOtherReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const getAvatarColor = (index: number) => {
    const colors = ['#9a0f21', '#6f42c1', '#007bff', '#28a745', '#fd7e14', '#20c997'];
    return colors[index % colors.length];
  };

  const handleBackPress = () => {
    router.back();
  };

  const fetchReviews = useCallback(
    async (isRefresh = false) => {
      if (!user) return;

      if (!isRefresh) {
        setIsLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from('food_reviews')
          .select('*, users(name)')
          .eq('date', date)
          .eq('type', type)
          .eq('daytime', daytime);

        if (error) {
          throw error;
        }

        const currentUserReview = data.find((r) => r.user_id === user.id) || null;
        const otherUsersReviews = data.filter((r) => r.user_id !== user.id);

        setExistingReview(currentUserReview);
        setOtherReviews(otherUsersReviews);

        if (currentUserReview) {
          setRating(currentUserReview.score);
          setComment(currentUserReview.comment || '');
        } else {
          setRating(0);
          setComment('');
        }
      } catch (error: any) {
        Alert.alert('Error', 'Failed to fetch reviews.');
      } finally {
        if (!isRefresh) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [user, date, type, daytime]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReviews(true);
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a review.');
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      score: rating,
      comment: comment.trim(),
    };

    try {
      if (isEditing && existingReview) {
        const { data, error } = await supabase
          .from('food_reviews')
          .update(reviewData)
          .eq('id', existingReview.id)
          .select()
          .single();

        if (error) throw error;
        setExistingReview(data);
        setIsEditing(false);
        Alert.alert('Review Updated', 'Your review has been successfully updated.');
        await fetchReviews(true);
      } else if (!existingReview) {
        const { error } = await supabase.from('food_reviews').insert([
          {
            ...reviewData,
            user_id: user.id,
            type,
            date,
            daytime,
          },
        ]);

        if (error) throw error;
        Alert.alert('Review Submitted', 'Thank you for your feedback!', [
          { text: 'OK', onPress: () => fetchReviews(true).then(() => router.back()) },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Submission Error', error.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmation = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteReview },
      ]
    );
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('food_reviews').delete().eq('id', existingReview.id);
      if (error) throw error;
      Alert.alert('Review Deleted', 'Your review has been removed.', [
        { text: 'OK', onPress: () => fetchReviews(true).then(() => router.back()) },
      ]);
    } catch (error: any) {
      Alert.alert('Delete Error', error.message || 'Failed to delete review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (existingReview) {
      setRating(existingReview.score);
      setComment(existingReview.comment || '');
    }
    setIsEditing(false);
  };

  const renderStars = (
    currentRating: number,
    onRate?: (rating: number) => void,
    interactive = false
  ) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      const isHalf = currentRating >= i - 0.5 && currentRating < i;
      const isFull = currentRating >= i;
      const starName = isFull ? 'star' : isHalf ? 'star-half' : 'star-border';

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onRate && onRate(i)}
          onLongPress={() => interactive && onRate && onRate(i - 0.5)}
          disabled={!interactive}
          style={[
            interactive ? styles.starButtonInteractiveSize : styles.starButtonReadOnly,
            interactive && styles.starButtonInteractive,
            (isFull || isHalf) && interactive && styles.starButtonActive
          ]}>
          <MaterialIcons 
            name={starName} 
            size={interactive ? 30 : 16} 
            color={isFull || isHalf ? '#FFD700' : '#E0E0E0'} 
          />
          {interactive && (
            <View style={styles.starNumber}>
              <Text style={styles.starNumberText}>{i}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return <View style={[styles.starsContainer, interactive ? styles.starsContainerInteractive : styles.starsContainerReadOnly]}>{stars}</View>;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reviews</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9a0f21" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we fetch the latest feedback</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isInteractive = !existingReview || isEditing;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {existingReview ? 'Your Review' : 'Leave a Review'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {type === 'kyk' ? 'KYK' : 'Yemekhane'} • {daytime} • {new Date(date).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        {existingReview && !isEditing ? (
          <TouchableOpacity onPress={handleDeleteConfirmation} disabled={isSubmitting} style={styles.headerButton}>
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.reviewInputCard}>
          <View style={styles.ratingInputSection}>
            <Text style={styles.ratingLabel}>Rate your experience</Text>
            <Text style={styles.ratingSubLabel}>Tap for whole stars, long press for half stars</Text>
            <View style={styles.ratingContainer}>
              {renderStars(rating, setRating, isInteractive)}
            </View>
            <View style={styles.ratingValueContainer}>
              <Text style={styles.ratingValue}>{rating}/10</Text>
            </View>
          </View>
          <View style={styles.commentInputSection}>
            <View style={styles.commentLabelContainer}>
              <Text style={styles.commentLabel}>Share your experience</Text>
              <Text style={styles.commentSubLabel}>Help others with your detailed feedback</Text>
            </View>
            <View style={[
              styles.commentInputContainer, 
              isCommentFocused && styles.commentInputFocused,
              !isInteractive && styles.commentInputDisabled
            ]}>
              <TextInput
                style={[styles.commentInput, !isInteractive && styles.disabledInput]}
                placeholder="What did you think about the food? How was the taste, portion size, temperature?"
                placeholderTextColor="#adb5bd"
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
                editable={isInteractive}
                onFocus={() => setIsCommentFocused(true)}
                onBlur={() => setIsCommentFocused(false)}
                maxLength={500}
              />
              <View style={styles.commentFooter}>
                <Text style={styles.characterCount}>
                  {comment.length}/500 characters
                </Text>
                <View style={styles.commentTips}>
                  <MaterialIcons name="lightbulb-outline" size={14} color="#6c757d" />
                  <Text style={styles.commentTipText}>
                    {comment.length < 20 ? 'Try to be specific about your experience' : 'Great detail!'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {existingReview && isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isSubmitting}>
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.disabledButton,
                !isInteractive && !existingReview && rating === 0 && styles.disabledButton,
              ]}
              onPress={() => {
                if (existingReview && !isEditing) {
                  setIsEditing(true);
                } else {
                  handleSubmitReview();
                }
              }}
              disabled={isSubmitting || (!isInteractive && !existingReview && rating === 0)}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {existingReview && !isEditing
                    ? 'Edit Review'
                    : isEditing
                    ? 'Update Review'
                    : 'Submit Review'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {otherReviews.length > 0 && (() => {
          const filteredReviews = starFilter !== null
            ? otherReviews.filter(review => Math.round(review.score) === starFilter)
            : otherReviews;
            
          return (
            <View style={styles.reviewsListSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsListTitle}>Other Reviews</Text>
                <View style={styles.reviewsCountBadge}>
                  <Text style={styles.reviewsCountText}>{otherReviews.length}</Text>
                </View>
              </View>

              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
                  <TouchableOpacity onPress={() => setStarFilter(null)} style={[styles.filterChip, starFilter === null && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, starFilter === null && styles.filterChipTextActive]}>All</Text>
                  </TouchableOpacity>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(star => (
                    <TouchableOpacity key={star} onPress={() => setStarFilter(star)} style={[styles.filterChip, starFilter === star && styles.filterChipActive]}>
                      <MaterialIcons name="star" size={14} color={starFilter === star ? '#fff' : '#495057'} />
                      <Text style={[styles.filterChipText, starFilter === star && styles.filterChipTextActive]}>{star}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, index) => {
                  const reviewerName = review.users?.name || 'Anonymous';
                  const reviewerInitial = reviewerName.charAt(0).toUpperCase();
                  
                  return (
                    <View key={review.id} style={[styles.reviewCard, { marginTop: index === 0 ? 0 : 12 }]}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={[styles.reviewerAvatar, { backgroundColor: getAvatarColor(index) }]}>
                            <Text style={styles.reviewerInitial}>{reviewerInitial}</Text>
                          </View>
                          <View style={styles.reviewerDetails}>
                            <Text style={styles.reviewerName}>{reviewerName}</Text>
                            <Text style={styles.reviewerDate}>
                              {new Date().toLocaleDateString('tr-TR')}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.reviewRating}>
                          <View style={styles.ratingBadge}>
                            <MaterialIcons name="star" size={16} color="#FFD700" />
                            <Text style={styles.reviewRatingText}>{review.score}/10</Text>
                          </View>
                        </View>
                      </View>
                      {review.comment ? (
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      ) : (
                        <Text style={styles.noCommentText}>No comment provided.</Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyStateContainer}>
                  <MaterialIcons name="rate-review" size={48} color="#adb5bd" />
                  <Text style={styles.emptyStateTitle}>No reviews match your filter</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Try selecting a different star rating or 'All'.
                  </Text>
                </View>
              )}
            </View>
          )
        })()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  reviewInputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  ratingInputSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#212529',
    textAlign: 'center',
  },
  ratingSubLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9a0f21',
  },
  ratingValueLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  commentInputSection: {
    marginBottom: 20,
  },
  commentLabelContainer: {
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#212529',
  },
  commentSubLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  commentInputContainer: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  commentInputFocused: {
    borderColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  commentInputDisabled: {
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  commentInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontFamily: 'System',
    lineHeight: 24,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#9a0f21',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0,
    elevation: 0,
  },
  reviewsListSection: {
    marginTop: 8,
    marginBottom: 100,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsListTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: 0.5,
  },
  reviewsCountBadge: {
    backgroundColor: '#9a0f21',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#9a0f21',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  reviewerDetails: {
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9a0f21',
    fontStyle: 'italic',
  },
  noCommentText: {
    fontSize: 14,
    color: '#adb5bd',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  commentTips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentTipText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  starButtonInteractiveSize: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    position: 'relative',
  },
  starButtonReadOnly: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  starButtonInteractive: {
    backgroundColor: 'rgba(154, 15, 33, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(154, 15, 33, 0.1)',
  },
  starButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    transform: [{ scale: 1.05 }],
  },
  starNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#9a0f21',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  starNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  reviewerDate: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  starsContainerInteractive: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  starsContainerReadOnly: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 4,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScrollView: {
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#9a0f21',
    borderColor: '#9a0f21',
    shadowColor: '#9a0f21',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default Reviews; 