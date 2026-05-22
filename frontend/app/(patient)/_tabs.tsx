// app/(patient)/_tabs.tsx
import React from 'react';
import { Tabs, useSegments, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function CustomTabBar() {
  const segments = useSegments();
  const router = useRouter();
  const active = segments[segments.length - 1] || 'home';

  const tabs: { key: string; label: string; icon: any; route: any }[] = [
    { key: 'home', label: 'Home', icon: 'home-outline', route: '/(patient)/home' },
    { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline', route: '/(patient)/dashboard' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: '/(patient)/notifications' },
    { key: 'profile', label: 'Profile', icon: 'person-circle-outline', route: '/(patient)/profile' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => {
        const focused = active === t.key;
        return (
          <Pressable key={t.key} style={styles.tabItem} onPress={() => router.replace(t.route as any)}>
            <Ionicons name={focused ? (t.icon.replace('-outline', '') as any) : (t.icon as any)} size={22} color={focused ? '#BA1A21' : '#6b6b6b'} />
            <Text style={[styles.tabLabel, { color: focused ? '#BA1A21' : '#6b6b6b' }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PatientTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => <CustomTabBar />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 },
});
