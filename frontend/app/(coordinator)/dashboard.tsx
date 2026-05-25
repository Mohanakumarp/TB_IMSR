import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearCoordinatorToken } from '../../lib/coordinatorClient';

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [coordinatorName] = useState('Coordinator');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          clearCoordinatorToken();
          router.replace('/(auth)/coordinator-login' as any);
        }
      }
    ]);
  };

  const navigationOptions = [
    {
      title: 'Create Appointment',
      description: 'Allocate new appointment to a patient',
      icon: 'calendar-plus-outline',
      route: '/(coordinator)/create-appointment',
      color: '#4CAF50'
    },
    {
      title: 'Manage Appointments',
      description: 'View and manage existing appointments',
      icon: 'calendar-check-outline',
      route: '/(coordinator)/manage-appointments',
      color: '#2196F3'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {coordinatorName}</Text>
            <Text style={styles.subGreeting}>Appointment Management Portal</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#BA1A21" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="people-outline" size={32} color="#1976D2" />
            <Text style={styles.statValue}>Manage</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="calendar-outline" size={32} color="#7B1FA2" />
            <Text style={styles.statValue}>Schedule</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
        </View>

        {/* Navigation Options */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.optionsContainer}>
          {navigationOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={28} color={option.color} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#1976D2" />
          <Text style={styles.infoText}>
            Use this portal to allocate appointments to patients and manage their treatment schedules.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333333',
  },
  subGreeting: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    marginLeft: 12,
    lineHeight: 20,
  },
});