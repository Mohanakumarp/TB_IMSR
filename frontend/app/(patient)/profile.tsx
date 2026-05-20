// app/(patient)/profile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export default function PatientProfile() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.opid) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.opid) return; 
      const res = await fetch(`${BACKEND_URL}/api/patient/${user.opid}/profile`, {
        // ADD THIS HEADERS OBJECT:
        headers: {
          'Authorization': `Bearer ${user?.sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error("Unauthorized or failed to fetch");

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading || !profile) return <View style={styles.center}><ActivityIndicator size="large" color="#BA1A21" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.patient_name)}</Text>
        </View>
        <Text style={styles.patientName}>{profile.patient_name}</Text>
        <Text style={styles.opNumberBadge}>{profile.opid}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="call-outline" size={20} color="#BA1A21" /></View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{profile.phone_number}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="medical-outline" size={20} color="#BA1A21" /></View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Primary Diagnosis</Text>
              <Text style={styles.infoValue}>{profile.diagnosis || 'Pending Validation'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="person-outline" size={20} color="#BA1A21" /></View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Primary Doctor</Text>
              <Text style={styles.infoValue}>{profile.doctors?.name || 'Not Assigned'}</Text>
              {profile.doctors?.department && <Text style={styles.subText}>{profile.doctors.department}</Text>}
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#BA1A21" style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>PSG Hospitals Tumor Board v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerSection: { alignItems: 'center', marginBottom: 32, marginTop: 18 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#BA1A21', justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  patientName: { fontSize: 24, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  opNumberBadge: { backgroundColor: '#E0E0E0', color: '#333333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 14, fontWeight: '700', overflow: 'hidden' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#828282', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, elevation: 2, borderWidth: 1, borderColor: '#E0E0E0' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FDECEA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#828282', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333333' },
  subText: { fontSize: 12, color: '#666', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 16 },
  logoutButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BA1A21', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  logoutIcon: { marginRight: 8 },
  logoutButtonText: { color: '#BA1A21', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#828282', fontSize: 12, marginTop: 24 }
});