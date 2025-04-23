'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  properties?: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string, role?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

    // Verifica autenticação inicial ao montar
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data } = await axios.get(`/api/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            timeout: 5000
          });
          if (data.user) {
            setUser(data.user);
            if (data.user.email) {
              localStorage.setItem('user_email', data.user.email);
            }
            document.cookie = `authToken=${storedToken}; path=/; max-age=${60*60*24*7}; SameSite=Strict`;
          } else {
            console.error('Resposta de validação inválida:', data);
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('auth_token');
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string, role?: string }> => {
    try {
      setIsLoading(true);
      console.log('Tentando login com:', email);
      const { data } = await axios.post(`/api/auth/login`, {
        email,
        password
      });
      
      console.log('Resposta do login:', data);
      
      if (!data.accessToken || !data.user) {
        return { success: false, message: 'Resposta de login inválida do servidor' };
      }
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('auth_token', data.accessToken);
      if (data.user.email) {
        localStorage.setItem('user_email', data.user.email);
      }
      document.cookie = `authToken=${data.accessToken}; path=/; max-age=${60*60*24*7}; SameSite=Strict`;
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      return { success: true, role: data.user.role };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let message = 'Erro ao fazer login';
      if (error.response?.data) {
        message = error.response.data.message || error.response.data.error || message;
      }
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token && refreshToken) {
      // Invalida refresh token no backend
      axios.post(
        `/api/auth/logout`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(error => {
        console.error('Error during logout:', error);
      });
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const isAdminPath = window.location.pathname.startsWith('/admin');
    router.push(isAdminPath ? '/admin/login' : '/login');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}