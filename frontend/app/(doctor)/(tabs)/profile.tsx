import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function DoctorProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of the portal?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Avatar & Header Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="medical" size={50} color="#BA1A21" />
          </View>
          <Text style={styles.nameText}>{user?.name || 'Physician'}</Text>
          <Text style={styles.roleText}>{user?.department || 'Department'}</Text>
        </View>

        {/* Account Details Card */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Hospital Profile Context</Text>
          
          {/* Specialty Row */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="git-branch-outline" size={20} color="#BA1A21" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Department / Vertical</Text>
              <Text style={styles.detailValue}>{user?.department || 'Not Assigned'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Row */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="call-outline" size={20} color="#BA1A21" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Registered Mobile</Text>
              <Text style={styles.detailValue}>{user?.phone_number || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* System ID Row */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="id-card-outline" size={20} color="#BA1A21" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Internal Doctor Identifier</Text>
              <Text style={styles.detailValue}>{user?.doctor_id || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#2E7D32" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Session Security status</Text>
              <Text style={[styles.detailValue, { color: '#2E7D32' }]}>Protected via Supabase Guard</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.appVersionText}>PSG Tumor Board Portal v2.0.26</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40 
  },
  avatarContainer: { 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 25 
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FDECEA', // Soft PSG Red background tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#BA1A21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  nameText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#333333' 
  },
  roleText: { 
    fontSize: 15, 
    color: '#666666', 
    fontWeight: '500',
    marginTop: 2 
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#999999', 
    marginBottom: 16, 
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  detailTextContainer: { 
    marginLeft: 14,
    flex: 1
  },
  detailLabel: { 
    fontSize: 12, 
    color: '#828282', 
    marginBottom: 2,
    fontWeight: '500'
  },
  detailValue: { 
    fontSize: 15, 
    color: '#333333', 
    fontWeight: '600' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F5F5F5', 
    marginVertical: 14 
  },
  logoutButton: {
    backgroundColor: '#BA1A21',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#BA1A21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700', 
    marginLeft: 8 
  },
  appVersionText: {
    textAlign: 'center',
    color: '#A0A0A0',
    fontSize: 11,
    marginTop: 25,
    fontWeight: '500'
  }
});