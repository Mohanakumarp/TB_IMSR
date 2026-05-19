// app/(patient)/home.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockLoggedInPatient } from '../../mock/data';
import { PatientHistoryItem } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function PatientHome() {
  const router = useRouter();
  const patient = mockLoggedInPatient;

  const getStatusStyle = (status: PatientHistoryItem['status']) => {
    switch (status) {
      case 'missed': return { bg: '#FDECEA', text: '#BA1A21', label: 'MISSED' }; // Soft red bg, PSG Red text
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', label: 'COMPLETED' }; 
      case 'upcoming': return { bg: '#F3F4F6', text: '#333333', label: 'UPCOMING' }; 
      default: return { bg: '#FAFAFA', text: '#828282', label: 'UNKNOWN' };
    }
  };

  const renderHistoryCard = ({ item }: { item: PatientHistoryItem }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/(patient)/procedure/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            <Ionicons name="calendar-outline" size={14} color="#828282" /> {item.scheduledDate}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
        
        <Text style={styles.procedureName}>{item.procedureName}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.tapPrompt}>View details & instructions</Text>
          <Ionicons name="chevron-forward" size={16} color="#BA1A21" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.greetingHeader}>
        <Text style={styles.greetingText}>Hello, {patient.name.split(' ')[0]}</Text>
        <Text style={styles.subGreetingText}>Your Procedure History</Text>
      </View>

      <FlatList
        data={patient.history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 36 }, // Use SafeAreaView + extra top padding so header isn't cut off
  greetingHeader: { padding: 16, paddingBottom: 8 },
  greetingText: { fontSize: 22, fontWeight: '700', color: '#333333' },
  subGreetingText: { fontSize: 13, color: '#828282', marginTop: 4 },
  listContainer: { padding: 12, paddingBottom: 40, paddingTop: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 14, fontWeight: '700', color: '#828282' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  procedureName: { fontSize: 18, fontWeight: 'bold', color: '#333333', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F5F5F5', paddingTop: 12 },
  tapPrompt: { fontSize: 13, color: '#BA1A21', fontWeight: '600' } // PSG Red accent
});