// app/(patient)/procedure/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { mockLoggedInPatient } from '../../../mock/data';

export default function ProcedureDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const procedure = mockLoggedInPatient.history.find(p => p.id === id);

  if (!procedure) return <View style={styles.centered}><Text>Not found.</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.label}>Procedure Name</Text>
        <Text style={styles.valueLarge}>{procedure.procedureName}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Scheduled Date</Text>
        <Text style={styles.valueDate}>{procedure.scheduledDate}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Current Status</Text>
        {/* Highlight status with PSG Red */}
        <Text style={[styles.valueStatus, { color: '#BA1A21' }]}>{procedure.status.toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Doctor's Notes</Text>
        <Text style={styles.notesText}>{procedure.tumorBoardNotes}</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 32 },
  scrollContent: { padding: 20, paddingTop: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2, borderWidth: 1, borderColor: '#E0E0E0' },
  label: { fontSize: 13, color: '#828282', marginBottom: 4, textTransform: 'uppercase' },
  valueLarge: { fontSize: 22, fontWeight: 'bold', color: '#333333' },
  valueDate: { fontSize: 18, fontWeight: '700', color: '#BA1A21' },
  valueStatus: { fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 16 },
  cardHeader: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 12 },
  notesText: { fontSize: 15, color: '#333333', lineHeight: 24 }
});