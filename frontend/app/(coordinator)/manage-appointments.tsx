import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchAppointments, updateAppointment, deleteAppointment } from '../../lib/coordinatorClient';

interface Appointment {
  appointment_id: string;
  opid: string;
  doctor_id: string;
  appointment_date: string;
  status: 'Scheduled' | 'Completed' | 'No-Show' | 'Cancelled';
  surgery_required: boolean;
  patients?: { patient_name: string; diagnosis: string };
  doctors?: { name: string; department: string };
  tumour_board_recommendations?: { recommended_plan: string }[];
}

export default function ManageAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
      console.error('Load appointments error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAppointments();
  }, [loadAppointments]);

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAppointments();
    }, [loadAppointments])
  );

  const filteredAppointments = appointments.filter(apt =>
    filter === 'All' || apt.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return { bg: '#F3F4F6', text: '#333333', icon: 'calendar' };
      case 'Completed': return { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-circle' };
      case 'Cancelled': return { bg: '#FDECEA', text: '#BA1A21', icon: 'close-circle' };
      case 'No-Show': return { bg: '#FFF3E0', text: '#E65100', icon: 'alert-circle' };
      default: return { bg: '#F5F5F5', text: '#666666', icon: 'help-circle' };
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;

    setUpdatingId(selectedAppointment.appointment_id);
    try {
      await updateAppointment(selectedAppointment.appointment_id, newStatus);
      Alert.alert('Success', 'Appointment updated successfully');
      setModalVisible(false);
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to update appointment');
      console.error('Update error:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    Alert.alert('Delete Appointment', 'Are you sure you want to delete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAppointment(appointment.appointment_id);
            Alert.alert('Success', 'Appointment deleted successfully');
            loadAppointments();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete appointment');
            console.error('Delete error:', error);
          }
        }
      }
    ]);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => {
    const statusInfo = getStatusColor(item.status);

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patients?.patient_name || 'Unknown Patient'}
            </Text>
            <Text style={styles.opid}>{item.opid}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.text} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-circle-outline" size={16} color="#BA1A21" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.doctors?.name} - {item.doctors?.department}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#BA1A21" />
            <Text style={styles.detailText}>{formatDateTime(item.appointment_date)}</Text>
          </View>

          {item.surgery_required && (
            <View style={styles.detailRow}>
              <Ionicons name="medical-outline" size={16} color="#BA1A21" />
              <Text style={[styles.detailText, { color: '#BA1A21', fontWeight: '600' }]}>
                Surgical Intervention Required
              </Text>
            </View>
          )}

          {item.tumour_board_recommendations && item.tumour_board_recommendations.length > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#BA1A21" />
              <Text style={[styles.detailText, { flex: 1 }]} numberOfLines={1}>
                {item.tumour_board_recommendations[0].recommended_plan}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedAppointment(item);
              setNewStatus(item.status);
              setModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={16} color="#2196F3" />
            <Text style={[styles.actionText, { color: '#2196F3' }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAppointment(item)}
          >
            <Ionicons name="trash" size={16} color="#BA1A21" />
            <Text style={[styles.actionText, { color: '#BA1A21' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#BA1A21" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Appointments</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['All', 'Scheduled', 'Completed', 'Cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive
            ]}
            onPress={() => setFilter(status as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <View style={[styles.container, styles.emptyState]}>
          <Ionicons name="calendar-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyText}>No {filter.toLowerCase()} appointments</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.appointment_id}
          renderItem={renderAppointmentCard}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      )}

      {/* Edit Status Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Appointment Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Patient</Text>
                  <Text style={styles.modalValue}>
                    {selectedAppointment.patients?.patient_name} ({selectedAppointment.opid})
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Current Status</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.status}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Update Status</Text>
                  <View style={styles.statusOptions}>
                    {['Scheduled', 'Completed', 'No-Show', 'Cancelled'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          newStatus === status && styles.statusOptionSelected
                        ]}
                        onPress={() => setNewStatus(status)}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            newStatus === status && styles.statusOptionTextSelected
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalButton, updatingId && styles.modalButtonDisabled]}
                  onPress={handleUpdateStatus}
                  disabled={updatingId !== null}
                >
                  {updatingId ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>Update Status</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#BA1A21',
    borderColor: '#BA1A21',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  opid: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  cardDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  modalSection: {
    marginTop: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusOption: {
    width: '48%',
    paddingVertical: 10,
    marginRight: '4%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: '#BA1A21',
    borderColor: '#BA1A21',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalButton: {
    backgroundColor: '#BA1A21',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});