import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, TextInput, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchPatients, fetchDoctors, createAppointment } from '../../lib/coordinatorClient';

interface Patient {
  opid: string;
  patient_name: string;
  phone_number: string;
  diagnosis: string;
}

interface Doctor {
  doctor_id: string;
  name: string;
  department: string;
  phone_number: string;
}

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Updated Form state for Date & Time ---
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const today = new Date();
  const [dateText, setDateText] = useState(today.toISOString().split('T')[0]); // YYYY-MM-DD
  const [timeText, setTimeText] = useState('10:00'); // HH:MM
  const [isPM, setIsPM] = useState(false); // false = AM, true = PM
  
  const [surgeryRequired, setSurgeryRequired] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState('');

  // Modal state
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, doctorsData] = await Promise.all([
          fetchPatients(),
          fetchDoctors()
        ]);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load data');
        console.error('Load data error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.patient_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.opid.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.department.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleCreateAppointment = async () => {
    if (!selectedPatient || !selectedDoctor) {
      Alert.alert('Error', 'Please select both patient and doctor');
      return;
    }

    // --- Parse the custom Date/Time inputs ---
    let finalISOString = '';
    try {
      let [hours, minutes] = timeText.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid time format');

      // Convert 12-hour AM/PM to 24-hour time
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      const paddedHours = hours.toString().padStart(2, '0');
      const paddedMinutes = minutes.toString().padStart(2, '0');

      // Combine into standard ISO format
      const constructedDate = new Date(`${dateText}T${paddedHours}:${paddedMinutes}:00`);
      
      if (isNaN(constructedDate.getTime())) throw new Error('Invalid date format');
      finalISOString = constructedDate.toISOString();
    } catch (error) {
      Alert.alert('Invalid Date/Time', 'Please ensure date is YYYY-MM-DD and time is HH:MM');
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment(
        selectedPatient.opid,
        selectedDoctor.doctor_id,
        finalISOString, // Use the stiched-together ISO string
        surgeryRequired,
        recommendedPlan || undefined
      );
      Alert.alert('Success', 'Appointment created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create appointment');
      console.error('Create appointment error:', error);
    } finally {
      setSubmitting(false);
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Appointment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Patient Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Patient</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setPatientModalVisible(true)}
          >
            <View style={styles.selectionContent}>
              <Ionicons name="person-outline" size={20} color="#BA1A21" />
              <View style={styles.selectionText}>
                <Text style={styles.selectionLabel}>Patient</Text>
                <Text style={styles.selectionValue} numberOfLines={1}>
                  {selectedPatient
                    ? `${selectedPatient.patient_name} (${selectedPatient.opid})`
                    : 'Select a patient'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          {selectedPatient && (
            <Text style={styles.selectionInfo}>Diagnosis: {selectedPatient.diagnosis}</Text>
          )}
        </View>

        {/* Doctor Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Doctor</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setDoctorModalVisible(true)}
          >
            <View style={styles.selectionContent}>
              <Ionicons name="medical-outline" size={20} color="#BA1A21" />
              <View style={styles.selectionText}>
                <Text style={styles.selectionLabel}>Doctor</Text>
                <Text style={styles.selectionValue} numberOfLines={1}>
                  {selectedDoctor
                    ? `${selectedDoctor.name} (${selectedDoctor.department})`
                    : 'Select a doctor'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* --- NEW: Split Date & Time Selection --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Date & Time</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Date Input */}
            <View style={{ flex: 2, marginRight: 8 }}>
              <Text style={styles.selectionLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dateText}
                onChangeText={setDateText}
                placeholder="2024-02-15"
                keyboardType="numeric"
              />
            </View>

            {/* Time Input */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.selectionLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={timeText}
                onChangeText={setTimeText}
                placeholder="10:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            {/* AM / PM Toggle */}
            <View style={{ flex: 0.8 }}>
              <Text style={styles.selectionLabel}>AM/PM</Text>
              <TouchableOpacity
                style={[
                  styles.input, 
                  { 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: isPM ? '#FFE0E0' : '#E0F7FA',
                    borderColor: isPM ? '#BA1A21' : '#00ACC1',
                    paddingHorizontal: 0
                  }
                ]}
                onPress={() => setIsPM(!isPM)}
              >
                <Text style={{ fontWeight: 'bold', color: isPM ? '#BA1A21' : '#00ACC1' }}>
                  {isPM ? 'PM' : 'AM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Surgery Required Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.sectionTitle}>Surgery Required</Text>
            <TouchableOpacity
              style={[styles.toggleButton, surgeryRequired && styles.toggleButtonActive]}
              onPress={() => setSurgeryRequired(!surgeryRequired)}
            >
              <Ionicons
                name={surgeryRequired ? 'checkmark' : 'close'}
                size={16}
                color={surgeryRequired ? '#2E7D32' : '#CCCCCC'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treatment Plan / Notes</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Enter recommended treatment plan or medical notes"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={recommendedPlan}
            onChangeText={setRecommendedPlan}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, submitting && styles.createButtonDisabled]}
          onPress={handleCreateAppointment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Appointment</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={patientModalVisible}
        animationType="slide"
        onRequestClose={() => setPatientModalVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPatientModalVisible(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Patient</Text>
            <View style={{ width: 60 }} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or OP ID"
            placeholderTextColor="#999"
            value={patientSearch}
            onChangeText={setPatientSearch}
          />

          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.opid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectedPatient(item);
                  setPatientModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.listItemTitle}>{item.patient_name}</Text>
                  <Text style={styles.listItemSubtitle}>{item.opid}</Text>
                </View>
                {selectedPatient?.opid === item.opid && (
                  <Ionicons name="checkmark-circle" size={24} color="#BA1A21" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>

      {/* Doctor Selection Modal */}
      <Modal
        visible={doctorModalVisible}
        animationType="slide"
        onRequestClose={() => setDoctorModalVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDoctorModalVisible(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <View style={{ width: 60 }} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or department"
            placeholderTextColor="#999"
            value={doctorSearch}
            onChangeText={setDoctorSearch}
          />

          <FlatList
            data={filteredDoctors}
            keyExtractor={(item) => item.doctor_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectedDoctor(item);
                  setDoctorModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSubtitle}>{item.department}</Text>
                </View>
                {selectedDoctor?.doctor_id === item.doctor_id && (
                  <Ionicons name="checkmark-circle" size={24} color="#BA1A21" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionText: {
    marginLeft: 12,
    flex: 1,
  },
  selectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectionInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  textarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#BA1A21',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#BA1A21',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  searchInput: {
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
});