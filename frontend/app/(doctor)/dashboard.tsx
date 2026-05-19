// app/(doctor)/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { mockDashboardData } from '../../mock/data';
import { PatientCardData } from '../../types';

export default function DoctorDashboard() {
  const router = useRouter();

  const getStatusStyle = (status: PatientCardData['status']) => {
    switch (status) {
      case 'missed': return { bg: '#FDECEA', text: '#BA1A21', label: 'MISSED' }; // PSG Red
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
      <View style={styles.headerBanner}>
        <Text style={styles.bannerTitle}>Doctor Portal</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome, Dr. Smith</Text>
        <Text style={styles.subText}>6 Tracked Tumor Board Patients</Text>
      </View>

      <FlatList
        data={mockDashboardData}
        keyExtractor={(item) => item.opNumber}
        renderItem={renderPatientCard}
        numColumns={2} 
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row} 
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' }, // PSG App background
  headerBanner: {
    backgroundColor: '#BA1A21',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerContainer: { padding: 20, paddingBottom: 10 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#333333' },
  subText: { fontSize: 13, color: '#666666', marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  opNumber: { fontSize: 12, fontWeight: 'bold', color: '#828282' },
  patientName: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 4 },
  procedureName: { fontSize: 13, color: '#666666', marginBottom: 16 },
  bottomRow: { marginTop: 'auto' },
  dateText: { fontSize: 12, fontWeight: '600', color: '#333333', marginBottom: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }
});