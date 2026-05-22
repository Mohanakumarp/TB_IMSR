// app/(doctor)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorTabsLayout() {
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#BA1A21', // PSG Red for active tab
        tabBarInactiveTintColor: '#828282',
        headerStyle: { backgroundColor: '#BA1A21' },
        headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: false, // We use a custom header inside the dashboard file
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}