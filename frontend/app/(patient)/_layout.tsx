// app/(patient)/_layout.tsx
import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const PSG_RED = '#BA1A21';
const PSG_BG = '#F5F5F5';
const INACTIVE = '#6B6B6B';

type TabItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: '/(patient)/home' | '/(patient)/notifications' | '/(patient)/profile' | '/(patient)/chat' | '/(patient)/dashboard';
};

function PatientTabBar() {
  const router = useRouter();
  const segments = useSegments();
  const activeTab = segments[segments.length - 1] || 'home';

  const tabs: TabItem[] = [
    { key: 'home', label: 'Home', icon: 'home-outline', route: '/(patient)/home' },
    { key: 'chat', label: 'AI', icon: 'chatbubbles-outline', route: '/(patient)/chat' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: '/(patient)/notifications' },
    { key: 'profile', label: 'Profile', icon: 'person-circle-outline', route: '/(patient)/profile' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const focused = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={() => router.replace(tab.route)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={focused ? PSG_RED : INACTIVE}
            />
            <Text style={[styles.tabLabel, { color: focused ? PSG_RED : INACTIVE }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PSG_RED,
        tabBarInactiveTintColor: INACTIVE,
      }}
      tabBar={() => <PatientTabBar />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="chat" options={{ title: 'AI' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: PSG_BG,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});