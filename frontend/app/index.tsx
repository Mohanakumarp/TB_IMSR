// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { role } = useAuth();

  // 1. If not logged in, send them to the login screen
  if (!role) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. If it's a doctor, send them to the doctor dashboard
  if (role === 'doctor') {
    return <Redirect href="/(doctor)/dashboard" />;
  }

  // 3. If it's a patient, send them to the patient dashboard
  if (role === 'patient') {
    return <Redirect href="/(patient)/dashboard" />;
  }

  // Fallback loading spinner just in case
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}