import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { useThemeColor } from '@/hooks/use-theme-color';

// Initialize Supabase (Use Anon Key here)
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
);

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.x.x:3000';

export default function PatientLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const sendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setStep(2);
      }
    } catch {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Send the session token to your Node.js backend
      try {
        await axios.post(
          `${BACKEND_URL}/api/auth/patient/verify`,
          {
            sessionToken: data.session?.access_token,
            phone: phone,
          }
        );
        Alert.alert('Success!', 'Backend confirmed patient exists.');
        // Navigate to patient dashboard or next screen
      } catch (err: any) {
        Alert.alert(
          'Access Denied',
          err.response?.data?.error || 'Unknown error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: textColor }]}>Patient Login</Text>

        {step === 1 ? (
          <>
            <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor={textColor + '80'}
              editable={!loading}
            />
            <Button
              title={loading ? 'Sending...' : 'Send OTP'}
              onPress={sendOTP}
              disabled={loading}
            />
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: textColor }]}>Enter OTP</Text>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor={textColor + '80'}
              keyboardType="numeric"
              editable={!loading}
            />
            <Button
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={verifyOTP}
              disabled={loading}
            />
            <Button
              title="Back"
              onPress={() => {
                setStep(1);
                setOtp('');
              }}
              color="gray"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
});
