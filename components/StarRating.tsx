import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  setRating,
  size = 28,
  disabled = false,
}) => {
  const handlePress = (newRating: number) => {
    if (!disabled && setRating) {
      // Allow setting rating to 0 if tapping the first half-star again
      if (rating === 0.5 && newRating === 0.5) {
        setRating(0);
      } else {
        setRating(newRating);
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((starValue) => {
        let iconName: 'star' | 'star-half' | 'star-border' = 'star-border';
        if (rating >= starValue) {
          iconName = 'star';
        } else if (rating >= starValue - 0.5) {
          iconName = 'star-half';
        }

        // Each star is wrapped in a view to contain the two touchable halves
        return (
          <View key={starValue} style={styles.starContainer}>
            <TouchableOpacity
              style={styles.touchableHalf}
              onPress={() => handlePress(starValue - 0.5)}
              disabled={disabled}
            />
            <TouchableOpacity
              style={styles.touchableHalf}
              onPress={() => handlePress(starValue)}
              disabled={disabled}
            />
            {/* The icon is positioned absolutely behind the touchable areas */}
            <View style={styles.iconContainer}>
              <MaterialIcons name={iconName} size={size} color="#FFD700" />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  starContainer: {
    position: 'relative',
    width: 28, // should be same as size
    height: 28, // should be same as size
    flexDirection: 'row',
  },
  touchableHalf: {
    flex: 1,
    height: '100%',
    zIndex: 1, // Make sure touchables are on top
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Icon is behind touchables
  },
});

export default StarRating; 