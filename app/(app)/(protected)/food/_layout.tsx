import { useColorScheme } from '@/utils/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { CartProvider } from './cart-context';

export default function FoodLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  return (
    <CartProvider>
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
            headerShown: true,
            headerTitle: 'KYK Menu',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />

        {/* Cafeteria Menu Screen */}
        <Stack.Screen
          name="cafeteria-menu"
          options={{
            title: 'Cafeteria Menu',
            headerShown: true,
            headerTitle: 'Cafeteria Menu',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />

        {/* Reviews Screen */}
        <Stack.Screen
          name="reviews"
          options={{
            title: 'Reviews',
            headerShown: true,
            headerTitle: 'Reviews',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
            ),
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
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </CartProvider>
  );
} 