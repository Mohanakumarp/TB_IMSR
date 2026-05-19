// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* headerShown: false hides the default ugly top bar */}
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}