'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, saveAuthData, clearAuthData, validateToken, refreshAccessToken, User } from '@/utils/api';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: 'user' | 'admin' }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Função para obter usuário atual do localStorage
  const getUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    try {
      return JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
      localStorage.removeItem('user');
      return null;
    }
  };

  // Inicializa o estado de autenticação
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Verifica se há um usuário no localStorage
        const storedUser = getUserFromStorage();
        
        if (storedUser) {
          // Se houver usuário, definimos o estado inicial
          setUser(storedUser);
          
          // Verificamos se o token ainda é válido na API
          const isValid = await validateToken();
          
          // Se não for válido, tentamos o refresh token
          if (!isValid) {
            try {
              // Tenta atualizar o token
              await refreshAccessToken();
              
              // Atualiza informações do usuário após refresh bem-sucedido
              const { user: currentUser } = await authApi.getCurrentUser();
              setUser(currentUser);
              
              // Salva o usuário atualizado no localStorage
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (refreshError) {
              // Se falhar no refresh, limpamos o estado
              console.error('Falha ao atualizar sessão:', refreshError);
              setUser(null);
              clearAuthData();
            }
          }
        } else {
          // Se não houver usuário no localStorage, definimos o estado como não autenticado
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; role?: 'user' | 'admin' }> => {
    setIsLoading(true);
    
    try {
      // Usar o utilitário de API para fazer login
      const response = await authApi.login({ email, password });
      
      // Definir o usuário atual
      setUser(response.user);
      
      return { 
        success: true, 
        message: 'Login bem-sucedido!', 
        role: response.user.role 
      };
    } catch (error) {
      console.error('Erro de login:', error);
      
      // Certifique-se de que o estado é limpo em caso de erro
      setUser(null);
      clearAuthData();
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Credenciais inválidas. Por favor, tente novamente.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Verificar se o usuário é admin antes de limpar os dados
      const isUserAdmin = user?.role === 'admin';
      
      // Chamar a API de logout
      await authApi.logout();
      
      // Limpar dados do usuário e token
      setUser(null);
      
      // Redirecionar com base na função do usuário
      if (isUserAdmin) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      // Mesmo em caso de erro, limpar os dados locais
      setUser(null);
      clearAuthData();
      
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar a sessão
  const refreshSession = async (): Promise<boolean> => {
    try {
      // Tenta atualizar o token
      await refreshAccessToken();
      
      // Atualiza informações do usuário
      const { user: currentUser } = await authApi.getCurrentUser();
      setUser(currentUser);
      
      // Salva o usuário atualizado no localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      
      // Se falhar, limpa o estado
      setUser(null);
      clearAuthData();
      
      return false;
    }
  };

  // Estados derivados
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout, 
        isAuthenticated, 
        isAdmin,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};