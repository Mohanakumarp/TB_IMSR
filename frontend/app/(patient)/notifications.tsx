// app/(patient)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mockLoggedInPatient } from '../../mock/data';
import { AppNotification } from '../../types';

export default function PatientNotifications() {
  const notifications = mockLoggedInPatient.notifications;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity style={styles.notificationCard}>
        <View style={styles.iconContainer}>
          {/* Changed icon color to PSG Red */}
          <Ionicons name="notifications" size={24} color="#BA1A21" />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.timeText}>{formatDateTime(item.date)}</Text>
          </View>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyText}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
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
  listContainer: { padding: 16, paddingBottom: 40, paddingTop: 8 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDECEA', // Light PSG Red background for the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333333', marginRight: 8 },
  timeText: { fontSize: 12, color: '#828282', fontWeight: '500' },
  messageText: { fontSize: 14, color: '#333333', lineHeight: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#828282', textAlign: 'center' }
});