// context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the possible roles
type Role = 'doctor' | 'patient' | null;

interface AuthContextType {
  role: Role;
  login: (assignedRole: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // By default, no one is logged in (role is null)
  const [role, setRole] = useState<Role>(null);

  const login = (assignedRole: Role) => setRole(assignedRole);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// A custom hook so any screen can easily check who is logged in
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};