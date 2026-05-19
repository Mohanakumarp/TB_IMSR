// app/(doctor)/patient/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockPatientDetails } from '../../../mock/data';
import { PatientCardData } from '../../../types';

export default function PatientDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const patient = id ? mockPatientDetails[id] : null;

  const getStatusStyle = (status: PatientCardData['status']) => {
    switch (status) {
      case 'missed': return { bg: '#FDECEA', text: '#BA1A21', label: 'MISSED' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', label: 'COMPLETED' };
      case 'upcoming': return { bg: '#F3F4F6', text: '#333333', label: 'UPCOMING' };
      default: return { bg: '#FAFAFA', text: '#828282', label: 'UNKNOWN' };
    }
  };

  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Patient record not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusStyle(patient.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.opNumber}>{patient.opNumber}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
        <Text style={styles.patientName}>{patient.patientName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Procedure Information</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Recommended Procedure:</Text>
          <Text style={styles.value}>{patient.procedureName}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Scheduled Date:</Text>
          <Text style={styles.value}>{patient.scheduledDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tumor Board Notes</Text>
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{patient.tumorBoardNotes}</Text>
        </View>
      </View>

      <Text style={styles.lastUpdated}>
        Last updated in EMR: {new Date(patient.lastUpdated).toLocaleDateString()}
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#828282', marginBottom: 20 },
  backButton: { padding: 12, backgroundColor: '#BA1A21', borderRadius: 8 }, // PSG Red Button
  backButtonText: { color: '#FFF', fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  opNumber: { fontSize: 14, fontWeight: 'bold', color: '#828282' },
  patientName: { fontSize: 24, fontWeight: '800', color: '#333333' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#828282', marginBottom: 12, marginLeft: 4 },
  infoBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  label: { fontSize: 12, color: '#828282', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 16, color: '#333333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 16 },
  notesBox: {
    backgroundColor: '#FAFAFA', 
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notesText: { fontSize: 15, color: '#333333', lineHeight: 24 },
  lastUpdated: { textAlign: 'center', color: '#828282', fontSize: 12, marginTop: 10 }
});