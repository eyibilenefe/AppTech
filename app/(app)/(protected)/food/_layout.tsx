import { useColorScheme } from '@/utils/useColorScheme';
import { Stack } from 'expo-router';

export default function FoodLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      {/* Main Food Home Screen */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Food & Dining',
          headerShown: false,
        }}
      />

      {/* KYK Menu Screen */}
      <Stack.Screen
        name="kyk-menu"
        options={{
          title: 'KYK Menu',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Cafeteria Menu Screen */}
      <Stack.Screen
        name="cafeteria-menu"
        options={{
          title: 'Cafeteria Menu',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Reviews Screen */}
      <Stack.Screen
        name="reviews"
        options={{
          title: 'Reviews',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Restaurant Detail Screen */}
      <Stack.Screen
        name="restaurant"
        options={{
          title: 'Restaurant Details',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Add to Cart Modal */}
      <Stack.Screen
        name="add-to-cart"
        options={{
          title: 'Add to Cart',
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Cart Screen */}
      <Stack.Screen
        name="cart"
        options={{
          title: 'Shopping Cart',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Order Details Screen */}
      <Stack.Screen
        name="order-details"
        options={{
          title: 'Order Details',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Order Status Screen */}
      <Stack.Screen
        name="order-status"
        options={{
          title: 'Order Status',
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
} 