// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with AsyncStorage for token persistence and automatic refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Persist tokens to device storage
    autoRefreshToken: true, // Automatically refresh expired tokens
    persistSession: true, // Keep session alive across app restarts
    detectSessionInUrl: false, // Not applicable for mobile apps
  },
});
