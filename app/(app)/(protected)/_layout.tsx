import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
		screenOptions={{
			headerShown: false,
			tabBarStyle: {
				backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
				borderTopWidth: 0,
				elevation: 0,
				height: Platform.OS === 'ios' ? 90 : 60,
				paddingBottom: Platform.OS === 'ios' ? 25 : 10,
				paddingTop: 10,
			},
			tabBarActiveTintColor: colorScheme === 'dark' ? Colors.dark.primary : Colors.light.primary,
			tabBarInactiveTintColor: colorScheme === 'dark' ? Colors.dark.muted : Colors.light.muted,
			tabBarShowLabel: true,
			tabBarLabelStyle: {
				fontSize: 12,
				fontWeight: '500',
			},
		}}
	>
      <Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="home" size={size} color={color} />
					),
				}}
			/>
      <Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color, size }) => (
						<IconSymbol size={28} name="paperplane.fill" color={color} />
					),
				}}
			/>
    </Tabs>
  );
}
