import { Redirect } from 'expo-router';

export default function ProtectedRoot() {
  return <Redirect href="/home" />;
} 