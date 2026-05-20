// app/(patient)/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Make sure to set your backend URL in your .env file
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.opid && user?.sessionToken) {
      fetchLatestAppointment();
    }
  }, [user]);

  const fetchLatestAppointment = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/patient/${user?.opid}/appointments`, {
        headers: {
          'Authorization': `Bearer ${user?.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch appointments");
      
      const data = await res.json();
      
      // Grab the most relevant appointment (you can adjust this logic, e.g., filter by 'Scheduled' first)
      if (data && data.length > 0) {
        setAppointment(data[0]); 
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientMessage = (status: string) => {
    switch (status) {
      case 'No-Show':
      case 'Cancelled': 
        return { 
          title: 'Appointment Missed', 
          desc: 'Our records indicate you missed your scheduled date. Please contact the hospital immediately to reschedule.',
          color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5'
        };
      case 'Completed': 
        return { 
          title: 'Procedure Completed', 
          desc: 'Your EMR has been updated successfully. A doctor will review your results.',
          color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC'
        };
      case 'Scheduled': 
        return { 
          title: 'Upcoming Procedure', 
          desc: 'Please ensure you arrive on time and follow any pre-procedure instructions.',
          color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD'
        };
      default: 
        return { title: 'No Status', desc: 'Awaiting updates.', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' };
    }
  };

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
      hour: 'numeric', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#BA1A21" />
      </View>
    );
  }

  // If the patient has no appointments at all
  if (!appointment) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.greeting}>Hello, {user?.patient_name?.split(' ')[0]}</Text>
        <Text style={styles.subGreeting}>No active procedures assigned.</Text>
      </View>
    );
  }

  const statusInfo = getPatientMessage(appointment.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <Text style={styles.greeting}>Hello, {user?.patient_name}</Text>
      <Text style={styles.subGreeting}>OP Number: {user?.opid}</Text>

      {/* STATUS ALERT BOX */}
      <View style={[styles.alertBox, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
        <Text style={[styles.alertTitle, { color: statusInfo.color }]}>{statusInfo.title}</Text>
        <Text style={[styles.alertDesc, { color: statusInfo.color }]}>{statusInfo.desc}</Text>
      </View>

      {/* PROCEDURE DETAILS CARD */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Your Assigned Procedure</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Procedure / Type:</Text>
          <Text style={styles.valueLarge}>
            {appointment.surgery_required ? 'Surgical Intervention' : 'Consultation'}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Scheduled Date:</Text>
          <Text style={styles.valueDate}>{formatDateTime(appointment.appointment_date)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.label}>Treating Doctor:</Text>
          <Text style={styles.valueLarge}>{appointment.doctors?.name}</Text>
        </View>
      </View>

      {/* INSTRUCTIONS CARD */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Tumour Board Notes</Text>
        <Text style={styles.notesText}>
          {appointment.tumour_board_recommendations?.recommended_plan || "No specific instructions provided yet."}
        </Text>
      </View>

      <Text style={styles.footerText}>
        If you have questions, please contact PSGIMSR support.
      </Text>

    </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
    paddingTop: 60, // Added padding to clear the top notch/header
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 24,
  },
  alertBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  alertDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  valueLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  valueDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BA1A21', // PSG Red
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  notesText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 24,
  },
  footerText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 10,
  }
});