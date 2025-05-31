import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';

import { SupabaseProvider } from '@/context/supabase-provider';

import '../global.css';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SupabaseProvider>
			<Slot />
		</SupabaseProvider>
  );
}
