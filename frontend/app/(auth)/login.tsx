// app/(auth)/login.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [loginType, setLoginType] = useState<'patient' | 'doctor'>('patient');
  const [opNumber, setOpNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const bgImage = require('./otp login image.jpeg');

  const handleGetOTP = async () => {
    if (loginType === 'patient' && (!opNumber || !phoneNumber)) {
        alert("Patients must enter both OP Number and Phone Number");
        return;
    }
    if (loginType === 'doctor' && !phoneNumber) {
        alert("Doctors must enter a Phone Number");
        return;
    }

    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91${formattedPhone}`;
    }

    // 1. Tell Supabase to generate and send the SMS
    const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
    });

    if (error) {
        alert(`Failed to send OTP: ${error.message}`);
        return;
    }

    // 2. Only navigate if the SMS was successfully requested
    router.push({
        pathname: '/(auth)/otp',
        params: { 
            role: loginType,
            phone: formattedPhone,
            opid: loginType === 'patient' ? opNumber : undefined
        }
    });
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Login Tumor Board Portal</Text>

                <View style={styles.tabContainer}>
                  <TouchableOpacity style={[styles.tab, loginType === 'patient' && styles.activeTab]} onPress={() => setLoginType('patient')}>
                    <Text style={[styles.tabText, loginType === 'patient' && styles.activeTabText]}>Patient</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.tab, loginType === 'doctor' && styles.activeTab]} onPress={() => setLoginType('doctor')}>
                    <Text style={[styles.tabText, loginType === 'doctor' && styles.activeTabText]}>Doctor</Text>
                  </TouchableOpacity>
                </View>

                {loginType === 'patient' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>OP Number</Text>
                    <TextInput style={styles.input} value={opNumber} onChangeText={setOpNumber} autoCapitalize="characters" />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" maxLength={10} />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleGetOTP}>
                  <Text style={styles.primaryButtonText}>Get OTP</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer - Coordinator Portal Link */}
            <View style={styles.coordinatorSection}>
              <Text style={styles.coordinatorText}>Are you a coordinator?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/coordinator-login' as any)}>
                <Text style={[styles.linkText, { textAlign: 'center', marginTop: 6 }]}>Access Coordinator Portal</Text>
              </TouchableOpacity>
            </View>

            {!keyboardVisible && (
              <View style={styles.footer} pointerEvents="none">
                <Text style={styles.footerText}>Copyright © PSG Hospitals 2026 | All Rights Reserved</Text>
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// ... keep your exact styles from above
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40, justifyContent: 'flex-end' },
  formContainer: { marginHorizontal: 20, backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#333333', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 24, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#828282' },
  activeTabText: { color: '#BA1A21' },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 15, color: '#333333', backgroundColor: '#FAFAFA' },
  primaryButton: { backgroundColor: '#BA1A21', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
  },
  linkText: {
    color: '#BA1A21',
    fontWeight: '600',
    fontSize: 14,
  },
  coordinatorSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
  },
  coordinatorText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
  },
});