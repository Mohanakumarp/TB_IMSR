// app/(patient)/home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../lib/apiClient';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function PatientHome() {
  const router = useRouter();
  const { user } = useAuth(); // Assume user is stored here after OTP login
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize the fetch function
  const fetchAppointments = useCallback(async () => {
    try {
      if (!user?.opid) return;
      
      // Use the apiGet wrapper which automatically injects the fresh auth token
      const res = await apiGet(`${BACKEND_URL}/api/patient/${user.opid}/appointments`);
      
      if (!res.ok) throw new Error("Unauthorized or failed to fetch");
      
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch appointments when user changes
  useEffect(() => {
    if (user?.opid) {
      setLoading(true);
      fetchAppointments();
    }
  }, [user, fetchAppointments]);
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'No-Show':
      case 'Cancelled': return { bg: '#FDECEA', text: '#BA1A21', label: status.toUpperCase() }; 
      case 'Completed': return { bg: '#E8F5E9', text: '#2E7D32', label: 'COMPLETED' }; 
      case 'Scheduled': return { bg: '#F3F4F6', text: '#333333', label: 'UPCOMING' }; 
      default: return { bg: '#FAFAFA', text: '#828282', label: 'UNKNOWN' };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const renderHistoryCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/(patient)/procedure/${item.appointment_id}`)}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            <Ionicons name="calendar-outline" size={14} color="#828282" /> {formatDateTime(item.appointment_date)}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>
        
        <Text style={styles.procedureName}>Appointment with {item.doctors?.name || 'Doctor'}</Text>
        <Text style={styles.planText} numberOfLines={2}>
          {item.tumour_board_recommendations?.recommended_plan || 'Consultation'}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.tapPrompt}>View details & instructions</Text>
          <Ionicons name="chevron-forward" size={16} color="#BA1A21" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#BA1A21" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.greetingHeader}>
        <Text style={styles.greetingText}>Hello, {user?.patient_name?.split(' ')[0] || 'Patient'}</Text>
        <Text style={styles.subGreetingText}>Your Treatment Schedule</Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.appointment_id}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No appointments found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greetingHeader: { padding: 16, paddingBottom: 8 },
  greetingText: { fontSize: 22, fontWeight: '700', color: '#333333' },
  subGreetingText: { fontSize: 13, color: '#828282', marginTop: 4 },
  listContainer: { padding: 12, paddingBottom: 40, paddingTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 14, fontWeight: '700', color: '#828282' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  procedureName: { fontSize: 18, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  planText: { fontSize: 14, color: '#666', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F5F5F5', paddingTop: 12 },
  tapPrompt: { fontSize: 13, color: '#BA1A21', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#828282', marginTop: 40 }
});