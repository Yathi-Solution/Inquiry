"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  location_id: number;
  roles: {
    role_id: number;
    role_name: string;
  };
  locations: {
    location_id: number;
    location_name: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedToken) {
      setToken(savedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: any) => {
    console.log('Login data received:', userData);
    const userObj = {
      user_id: userData.user.user_id,
      name: userData.user.name,
      email: userData.user.email,
      role_id: userData.user.role_id,
      location_id: userData.user.location_id,
      roles: userData.user.roles,
      locations: userData.user.locations
    };
    console.log('User object created:', userObj);
    setUser(userObj);
    setToken(userData.access_token);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', userData.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading,
      isAuthenticated: !!token
    }}>
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
