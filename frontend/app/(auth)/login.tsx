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

  const handleGetOTP = () => {
    if (loginType === 'patient' && (!opNumber || !phoneNumber)) {
      alert("Patients must enter both OP Number and Phone Number");
      return;
    }
    
    if (loginType === 'doctor' && !phoneNumber) {
      alert("Doctors must enter a Phone Number");
      return;
    }

    router.push({
      pathname: '/(auth)/otp',
      params: { role: loginType }
    });
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {/* keep only the form over the background and anchor lower */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  redHeader: {
    backgroundColor: '#BA1A21',
    paddingVertical: 16,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  brandSection: {
    paddingVertical: 8,
    alignItems: 'center',
    display: 'none',
  },
  logoText: {
    fontSize: 56,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    display: 'none',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#828282',
    display: 'none',
  },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828282',
  },
  activeTabText: {
    color: '#BA1A21',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  primaryButton: {
    backgroundColor: '#BA1A21',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#BA1A21',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#A01520',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});