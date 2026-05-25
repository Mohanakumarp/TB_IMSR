// app/index.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getCoordinatorToken } from '../lib/coordinatorClient';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if coordinator is logged in
    const coordinatorToken = getCoordinatorToken();
    if (coordinatorToken) {
      router.replace('/(coordinator)/dashboard' as any);
      return;
    }

    // Check if patient/doctor is logged in
    if (!user) {
      router.replace('/(auth)/login');
    } else if (user.role === 'patient') {
      router.replace('/(patient)/home');
    } else if (user.role === 'doctor') {
      router.replace('/(doctor)/(tabs)/dashboard');
    }
  }, [user, isLoading, router]);

  return <View />;
}