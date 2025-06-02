import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Review {
  id: string;
  reviewerName: string;
  time: string;
  rating: number;
  comment: string;
}

const dummyReviews: Review[] = [
  {
    id: '1',
    reviewerName: 'Ahmet K.',
    time: '2 hours ago',
    rating: 8,
    comment: 'Great taste and good portion size. The eggs were perfectly cooked!',
  },
  {
    id: '2',
    reviewerName: 'Anonymous',
    time: '5 hours ago',
    rating: 6,
    comment: 'Food was okay, but could use more seasoning. Service was quick though.',
  },
  {
    id: '3',
    reviewerName: 'Zehra M.',
    time: '1 day ago',
    rating: 9,
    comment: 'Excellent breakfast! Fresh ingredients and very filling. Highly recommend.',
  },
  {
    id: '4',
    reviewerName: 'Mehmet T.',
    time: '2 days ago',
    rating: 7,
    comment: 'Good value for money. The bread was fresh and the cheese was quality.',
  },
  {
    id: '5',
    reviewerName: 'Anonymous',
    time: '3 days ago',
    rating: 5,
    comment: 'Average meal. Nothing special but gets the job done.',
  },
];

const Reviews = () => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(dummyReviews);

  const handleBackPress = () => {
    router.back();
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    const newReview: Review = {
      id: String(reviews.length + 1),
      reviewerName: 'You',
      time: 'Just now',
      rating,
      comment: comment.trim() || 'No comment provided',
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setComment('');
    Alert.alert('Review Submitted', 'Thank you for your feedback!');
  };

  const renderStars = (rating: number, onPress?: (rating: number) => void, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress && onPress(i)}
          disabled={!interactive}
        >
          <MaterialIcons
            name="star"
            size={interactive ? 28 : 16}
            color={i <= rating ? '#FFD700' : '#E0E0E0'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Rating */}
        <View style={styles.overallRatingCard}>
          <Text style={styles.overallRatingTitle}>Overall Rating</Text>
          <View style={styles.overallRatingContent}>
            <Text style={styles.overallRatingValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.overallRatingOutOf}>/ 10</Text>
          </View>
          {renderStars(Math.round(averageRating))}
          <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
        </View>

        {/* Review Input */}
        <View style={styles.reviewInputCard}>
          <Text style={styles.reviewInputTitle}>Leave a Review</Text>
          
          {/* Rating Input */}
          <View style={styles.ratingInputSection}>
            <Text style={styles.ratingLabel}>Your Rating (1-10):</Text>
            {renderStars(rating, setRating, true)}
            <Text style={styles.ratingValue}>{rating}/10</Text>
          </View>

          {/* Comment Input */}
          <View style={styles.commentInputSection}>
            <Text style={styles.commentLabel}>Leave a comment:</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience..."
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsListSection}>
          <Text style={styles.reviewsListTitle}>Recent Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  <Text style={styles.reviewTime}>{review.time}</Text>
                </View>
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                  <Text style={styles.reviewRatingText}>{review.rating}/10</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

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
  overallRatingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  overallRatingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  overallRatingContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  overallRatingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  overallRatingOutOf: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewInputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  reviewInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ratingInputSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center',
  },
  commentInputSection: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsListSection: {
    marginBottom: 20,
  },
  reviewsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default Reviews; 