// app/(doctor)/(tabs)/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../lib/apiClient'; // Import your API wrapper
import { PatientCardData } from '../../../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user } = useAuth(); // Get doctor info, including doctor_id
  
  const [patients, setPatients] = useState<PatientCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from your Express backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.doctor_id) return;
      
      try {
        setLoading(true);
        const response = await apiGet(`${BACKEND_URL}/api/doctor/${user.doctor_id}/dashboard`);
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.doctor_id]);

  const getStatusStyle = (status: PatientCardData['status']) => {
    switch (status) {
      case 'missed': return { bg: '#FDECEA', text: '#BA1A21', label: 'MISSED' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', label: 'COMPLETED' }; 
      case 'upcoming': return { bg: '#F3F4F6', text: '#333333', label: 'UPCOMING' }; 
      default: return { bg: '#FAFAFA', text: '#828282', label: 'UNKNOWN' };
    }
  };

  const renderPatientCard = ({ item }: { item: PatientCardData }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/(doctor)/patient/${item.opNumber}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.opNumber}>{item.opNumber}</Text>
        </View>
        
        <Text style={styles.patientName} numberOfLines={1}>{item.patientName}</Text>
        <Text style={styles.procedureName} numberOfLines={1}>{item.procedureName}</Text>
        
        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>{item.scheduledDate}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'Doctor'}</Text>
        <Text style={styles.subText}>{patients.length} Tracked Tumor Board Patients</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#BA1A21" />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.opNumber}
          renderItem={renderPatientCard}
          numColumns={2} 
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No patients assigned currently.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ... keep your exact same styles ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerContainer: { padding: 20, paddingTop: 10, paddingBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333333' },
  subText: { fontSize: 14, color: '#666666', marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '48%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2, borderWidth: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  opNumber: { fontSize: 12, fontWeight: 'bold', color: '#828282' },
  patientName: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 4 },
  procedureName: { fontSize: 13, color: '#666666', marginBottom: 16 },
  bottomRow: { marginTop: 'auto' },
  dateText: { fontSize: 12, fontWeight: '600', color: '#333333', marginBottom: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#828282', marginTop: 40 }
});