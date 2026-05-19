// app/(doctor)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DoctorLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Tumor Board Dashboard',
          // MATCHING THE PSG RED HEADER
          headerStyle: { backgroundColor: '#BA1A21' },
          headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="patient/[id]" 
        options={{ 
          title: 'Patient Details',
          headerStyle: { backgroundColor: '#BA1A21' },
          headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
          headerTintColor: '#FFFFFF', // Makes the back arrow white
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 14,
  }
});