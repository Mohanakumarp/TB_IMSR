// app/(doctor)/_layout.tsx
import { Stack } from 'expo-router';

export default function DoctorRootLayout() {
  return (
    <Stack>
      {/* 1. Hide the header for the tabs folder so the tabs can manage their own headers */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      
      {/* 2. Patient Details Screen (Slides over the tabs) */}
      <Stack.Screen 
        name="patient/[id]" 
        options={{ 
          title: 'Patient Details',
          headerStyle: { backgroundColor: '#BA1A21' },
          headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
          headerTintColor: '#FFFFFF', // White back arrow
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}