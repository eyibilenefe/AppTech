import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface BusMarkerProps {
  size?: number;
  color?: string;
  isMoving?: boolean;
}

const BusMarker: React.FC<BusMarkerProps> = ({ 
  size = 30, 
  color = '#9a0f21',
  isMoving = false 
}) => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (isMoving) {
      animationValue.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      animationValue.value = withTiming(0);
    }
  }, [isMoving]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationValue.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(animationValue.value, [0, 1], [1, 0.8]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.markerContainer, { backgroundColor: color }, animatedStyle]}>
        <Ionicons name="bus" size={size * 0.6} color="white" />
      </Animated.View>
      {isMoving && (
        <View style={[styles.pulse, { backgroundColor: color }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'white',
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
    zIndex: -1,
  },
});

export default BusMarker; 