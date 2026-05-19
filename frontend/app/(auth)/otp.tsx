// app/(auth)/otp.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const bgImage = require('./otp login image.jpeg');

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = (params?.role as 'doctor' | 'patient') || 'patient';
  let login: ((r: 'doctor'|'patient'|null) => void) | undefined = undefined;
  try {
    const auth = useAuth();
    login = auth?.login;
  } catch (e) {
    // no-op if provider missing
    login = undefined;
  }

  const [otp, setOtp] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // legacy helper removed; using `onVerify` for role-aware navigation

  const onVerify = () => {
    // route based on role and OTP
    if (role === 'doctor' && otp === '0000') {
      try { login('doctor'); } catch (e) {}
      router.replace('/(doctor)/dashboard');
      return;
    }
    if (role === 'patient' && otp === '1111') {
      try { login('patient'); } catch (e) {}
      router.replace('/(patient)/home');
      return;
    }
    alert('Invalid OTP for this role. Try 0000 for doctor or 1111 for patient (testing).');
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.formWrapper}>
                <Text style={styles.title}>OTP Verification</Text>
                <Text style={styles.subtitle} numberOfLines={3}>
                  Enter the 4-digit code sent to your mobile to continue as {role === 'doctor' ? 'Doctor' : 'Patient'}.
                </Text>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="• • • •"
                    placeholderTextColor="#c7c7c7"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                    textContentType="oneTimeCode"
                  />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={onVerify}>
                  <Text style={styles.primaryButtonText}>Verify</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                  <Text style={styles.secondaryButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

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

const { width } = Dimensions.get('window');
const FORM_WIDTH = Math.min(680, width - 40);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40 },
  overlayTop: { height: 0 },
  formWrapper: {
    alignSelf: 'center',
    width: FORM_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#2b2b2b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b6b6b', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  inputGroup: { alignItems: 'center', marginBottom: 18 },
  otpInput: {
    width: '60%',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    color: '#BA1A21',
  },
  primaryButton: {
    backgroundColor: '#BA1A21',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', paddingVertical: 8 },
  secondaryButtonText: { color: '#6b6b6b', fontSize: 15 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  footerText: { color: '#333', fontSize: 12, textAlign: 'center', opacity: 0.9 },
});