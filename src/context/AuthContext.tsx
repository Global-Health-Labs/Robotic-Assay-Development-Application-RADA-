import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProfileRequest } from '../api/auth.api';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  logout: () => void;
  name: string;
  role: string;
  id: string;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [id, setId] = useState('');

  const logout = () => {
    window.localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    const token = window.localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getProfileRequest();
      if (response.status === 200 && response.data && response.data.user.confirmed) {
        setName(response.data.user.fullName || '');
        setRole(response.data.user.role);
        setId(response.data.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Authentication verification failed', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    logout,
    name,
    role,
    id,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
