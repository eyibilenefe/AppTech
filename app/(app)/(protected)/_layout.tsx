import { Tabs } from 'expo-router';
import React from 'react';

import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transportation"
        options={{
          title: "Transportation",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-bus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: "Food",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
