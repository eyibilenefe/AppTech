import { useColorScheme } from '@/utils/useColorScheme';
import { Stack } from 'expo-router';

export default function HomeLayout() {
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
      <Stack.Screen
        name="index"
        options={{
            title: 'Home',
            headerShown: false,
            presentation: 'card',
        }}
        />

    {/* AI Chat Screen */}
      <Stack.Screen
        name="ai-chat"
        options={{
          title: 'IYTE-bot',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Profile Screen */}
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* QR Payment Screen */}
      <Stack.Screen
        name="qr-payment"
        options={{
          title: 'QR Payment',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Top Up Screen */}
      <Stack.Screen
        name="top-up"
        options={{
          title: 'Top-up Balance',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Cafeteria Reservation Screen */}
      <Stack.Screen
        name="cafeteria-reservation"
        options={{
          title: 'Food Reservation',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Facility Reservation Screen */}
      <Stack.Screen
        name="facility-reservation"
        options={{
          title: 'Sport Reservation',
          headerShown: false,
          presentation: 'card',
        }}
      />

      {/* Calendar Screen */}
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
} 