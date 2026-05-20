// app/(patient)/notifications.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function PatientNotifications() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.opid) fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/patient/${user?.opid}/appointments`, {
        // ADD THIS HEADERS OBJECT:
        headers: {
          'Authorization': `Bearer ${user?.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error("Unauthorized or failed to fetch");

      const data = await res.json();
      const upcoming = data.filter((item: any) => item.status === 'Scheduled');
      setAlerts(upcoming);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const renderNotification = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.notificationCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={24} color="#BA1A21" />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>Upcoming Appointment</Text>
            <Text style={styles.timeText}>Just now</Text>
          </View>
          <Text style={styles.messageText}>
            You have a {item.surgery_required ? 'surgery' : 'consultation'} scheduled for {formatDateTime(item.appointment_date)} with {item.doctors?.name}.
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#BA1A21" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyText}>You have no new alerts.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.appointment_id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 40, paddingTop: 8 },
  notificationCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FDECEA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333333', marginRight: 8 },
  timeText: { fontSize: 12, color: '#828282', fontWeight: '500' },
  messageText: { fontSize: 14, color: '#333333', lineHeight: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#828282', textAlign: 'center' }
});