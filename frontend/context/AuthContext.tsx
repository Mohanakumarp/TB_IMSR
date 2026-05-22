// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface User {
  role: 'doctor' | 'patient';
  opid?: string;
  doctor_id?: string;
  patient_name?: string;
  doctor_name?: string;
  name?: string;
  phone_number?: string;
  phone?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check stored user data and Supabase session on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if Supabase session exists (handles token refresh automatically)
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (session) {
          // If Supabase session exists, load stored user profile from AsyncStorage
          const storedUser = await AsyncStorage.getItem('@hospital_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          // No session means user is logged out
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // 2. Save user profile to storage when they log in
  const login = async (userData: User) => {
    setUser(userData);
    try {
      // Store only the user profile data, NOT the auth token (Supabase handles that)
      await AsyncStorage.setItem('@hospital_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user to storage', error);
    }
  };

  // 3. Log out user: clear Supabase session and local storage
  const logout = async () => {
    setUser(null);
    try {
      // Sign out from Supabase (clears tokens automatically)
      await supabase.auth.signOut();
      // Clear stored user profile
      await AsyncStorage.removeItem('@hospital_user');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};