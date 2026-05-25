import { Stack } from 'expo-router';

export default function CoordinatorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="create-appointment" options={{ title: 'Create Appointment' }} />
      <Stack.Screen name="manage-appointments" options={{ title: 'Manage Appointments' }} />
    </Stack>
  );
}