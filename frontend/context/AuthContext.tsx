// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  role: 'doctor' | 'patient';
  sessionToken: string;
  opid?: string;
  doctor_id?: string;
  patient_name?: string;
  name?: string;
  phone_number?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // Add this so we don't flash the login screen while checking storage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check the phone's hard drive when the app opens
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@hospital_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // 2. Save the user to the phone's hard drive when they log in
  const login = async (userData: User) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem('@hospital_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to storage", error);
    }
  };

  // 3. Delete the user from the hard drive when they log out
  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('@hospital_user');
    } catch (error) {
      console.error("Failed to remove user from storage", error);
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