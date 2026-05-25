// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Patient Login' }} />
      <Stack.Screen name="otp" options={{ title: 'OTP Verification' }} />
      <Stack.Screen name="coordinator-login" options={{ title: 'Coordinator Login' }} />
    </Stack>
  );
}