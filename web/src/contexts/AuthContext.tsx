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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string, role?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log('Validando token armazenado');
          const { data } = await axios.get(`/api/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            // Adicionar timeout para evitar espera infinita
            timeout: 5000
          });
          
          if (data.user) {
            console.log('Usuário autenticado:', data.user);
            setUser(data.user);
            
            // Armazenar email do usuário para identificação na página de gerenciamento
            if (data.user.email) {
              localStorage.setItem('user_email', data.user.email);
            }
            
            // Configurar cookie para autenticação alternativa
            
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
      
      // Verificar se recebemos os dados esperados
      if (!data.accessToken || !data.user) {
        console.error('Resposta de login inválida:', data);
        return { success: false, message: 'Resposta de login inválida do servidor' };
      }
      
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('auth_token', data.accessToken);
      
      // Armazenar email do usuário para identificação na página de gerenciamento
      if (data.user.email) {
        localStorage.setItem('user_email', data.user.email);
      }
      
      // Configurar cookie para autenticação alternativa
      document.cookie = `authToken=${data.accessToken}; path=/; max-age=${60*60*24*7}; SameSite=Strict`;
      
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      
      return { success: true, role: data.user.role };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extrair mensagem de erro mais detalhada
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
      // Call the logout endpoint to invalidate refresh token
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
    
    // Limpar cookie de autenticação
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Determinar para onde redirecionar com base no caminho atual
    const isAdminPath = window.location.pathname.startsWith('/admin');
    router.push(isAdminPath ? '/admin/login' : '/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout }}>
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