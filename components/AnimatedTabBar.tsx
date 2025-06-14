import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TabItemProps {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colorScheme: 'light' | 'dark';
  animatedValue: Animated.Value;
}

const TabItem: React.FC<TabItemProps> = ({
  route,
  index,
  isFocused,
  onPress,
  onLongPress,
  colorScheme,
  animatedValue,
}) => {
  const colors = Colors[colorScheme];
  
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const iconScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const backgroundOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const getTabIcon = (routeName: string, color: string, size: number) => {
    switch (routeName) {
      case 'home':
        return <MaterialIcons name="credit-card" size={size} color={color} />;
      case 'explore':
        return <MaterialIcons name="explore" size={size} color={color} />;
      case 'transportation':
        return <MaterialIcons name="directions-bus" size={size} color={color} />;
      case 'food':
        return <MaterialIcons name="restaurant" size={size} color={color} />;
      case 'community':
        return <MaterialIcons name="event" size={size} color={color} />;
      case 'social':
        return <MaterialIcons name="people" size={size} color={color} />;
      default:
        return <MaterialIcons name="circle" size={size} color={color} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
      }}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      }}
      activeOpacity={0.6}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale }, { translateY }],
        }}
      >
        {/* Icon Background for Active State */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 45,
            height: 45,
            borderRadius: 22.5,
            backgroundColor: isFocused 
              ? (colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.1)')
              : 'transparent',
            opacity: backgroundOpacity,
            transform: [{ scale: iconScale }],
          }}
        />

        {/* Icon Container */}
        <Animated.View
          style={{
            width: 45,
            height: 45,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getTabIcon(
            route.name,
            "#FFFFFF",
            isFocused ? 26 : 24
          )}
        </Animated.View>

        {/* Active Indicator Dot */}
        {isFocused && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: -12,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              opacity: backgroundOpacity,
            }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const animatedValues = React.useRef(
    state.routes.map((_: any, index: number) => new Animated.Value(index === state.index ? 1 : 0))
  ).current;

  React.useEffect(() => {
    animatedValues.forEach((animatedValue: Animated.Value, index: number) => {
      if (index === state.index) {
        Animated.spring(animatedValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 130,
          friction: 6,
        }).start();
      } else {
        Animated.spring(animatedValue, {
          toValue: 0,
          useNativeDriver: true,
          tension: 130,
          friction: 6,
        }).start();
      }
    });
  }, [state.index]);

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom,
        left: 20,
        right: 20,
        height: 65,
        backgroundColor: "#9a0f21",
        borderRadius: 32.5,
        shadowColor: colorScheme === 'dark' ? '#000' : '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 20,
      }}
    >
      {/* Background Blur Effect */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 32.5,
          backgroundColor: "#9a0f21",
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Tab Items Container */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 15,
          height: '100%',
        }}
      >
        {state.routes
          .filter((route: any) => [
            'home',
            'transportation',
            'food',
            'community',
            'social',
          ].includes(route.name))
          .map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                index={index}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                colorScheme={colorScheme}
                animatedValue={animatedValues[index]}
              />
            );
          })}
      </View>
    </View>
  );
}; 