import { Stack } from 'expo-router';
import React from 'react';

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We'll handle headers in individual screens
        animation: 'slide_from_right', // Smooth slide animation
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: "Community Events"
        }}
      />
      <Stack.Screen 
        name="list" 
        options={{
          title: "Communities",
          presentation: 'modal', // Present as modal for better UX
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          title: "Community Details",
        }}
      />
      <Stack.Screen 
        name="eventDetail" 
        options={{
          title: "Event Details",
        }}
      />
    </Stack>
  );
} 