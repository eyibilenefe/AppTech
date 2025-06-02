import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AiChatScreen from './home/ai-chat';
import CafeteriaReservationScreen from './home/cafeteria-reservation';
import CalendarScreen from './home/calendar';
import FacilityReservationScreen from './home/facility-reservation';
import HomeScreen from './home/index';
import ProfileScreen from './home/profile';
import QrPaymentScreen from './home/qr-payment';
import SettingsScreen from './home/settings';
import TopUpScreen from './home/top-up';

const Stack = createStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" component={HomeScreen} />
      <Stack.Screen name="calendar" component={CalendarScreen} />
      <Stack.Screen name="facility-reservation" component={FacilityReservationScreen} />
      <Stack.Screen name="cafeteria-reservation" component={CafeteriaReservationScreen} />
      <Stack.Screen name="top-up" component={TopUpScreen} />
      <Stack.Screen name="qr-payment" component={QrPaymentScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="ai-chat" component={AiChatScreen} />
    </Stack.Navigator>
  );
};

export default Home;
