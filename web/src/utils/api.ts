// src/utils/api.ts
// Utilitário para fazer requisições à API

// URL base da API - usando o proxy /api configurado no next.config.js
const API_URL = '';  // Vazio para usar o proxy de API do Next.js

const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

// Log para debug em ambiente de desenvolvimento
if (ENV === 'development' && typeof window !== 'undefined') {
  console.log(`API configurada para uso através do proxy interno (${ENV})`);
}

// Tipos para as requisições e respostas
interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

// Definindo tipos para as respostas da API para melhor type-safety
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  message?: string;
}

// Armazenamento de tokens em memória (mais seguro que localStorage para tokens de curta duração)
let inMemoryToken: string | null = null;
let refreshTokenInProgress: Promise<string> | null = null;

/**
 * Define o token em memória
 */
export function setToken(token: string | null): void {
  inMemoryToken = token;
}

/**
 * Obtém o token atual (da memória ou localStorage)
 */
export function getToken(): string | null {
  // Primeiro tenta da memória (para o token de curta duração)
  if (inMemoryToken) {
    return inMemoryToken;
  }
  
  // Se não estiver na memória, tenta do localStorage (para persistência entre recarregamentos)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Se for encontrado no localStorage, colocar na memória também
      inMemoryToken = token;
      return token;
    }
  }
  
  return null;
}

/**
 * Salva os dados de autenticação
 */
export function saveAuthData(data: AuthResponse): void {
  // Salva o accessToken em memória para uso imediato
  inMemoryToken = data.accessToken;
  
  // Salva o refreshToken e dados do usuário no localStorage para persistência
  if (typeof window !== 'undefined') {
    // No localStorage só salvamos o refreshToken (mais duradouro) e os dados do usuário
    localStorage.setItem('auth_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

/**
 * Limpa os dados de autenticação
 */
export function clearAuthData(): void {
  inMemoryToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

/**
 * Verifica se o token está expirado baseado na decodificação do JWT
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Converter para milissegundos
    return Date.now() >= expiry;
  } catch (e) {
    return true; // Se houver erro na decodificação, consideramos expirado
  }
}

/**
 * Atualiza o token de acesso usando o refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  // Se já houver um refresh em andamento, retorna a mesma Promise
  if (refreshTokenInProgress) {
    return refreshTokenInProgress;
  }
  
  // Inicia um novo processo de refresh
  refreshTokenInProgress = (async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Refresh token não disponível');
      }
      
      const response = await fetch(`/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include', // Para enviar/receber cookies
      });
      
      if (!response.ok) {
        // Se o refresh falhar, limpamos os dados de autenticação
        clearAuthData();
        throw new Error('Falha ao atualizar o token');
      }
      
      const data: RefreshResponse = await response.json();
      
      // Salvamos o novo access token em memória
      inMemoryToken = data.accessToken;
      
      // Atualizamos o refresh token se vier na resposta
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      
      return data.accessToken;
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      // Limpa a referência para permitir novas tentativas
      refreshTokenInProgress = null;
    }
  })();
  
  return refreshTokenInProgress;
}

/**
 * Faz uma requisição autenticada para a API com suporte a refresh token
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // Determina se estamos no cliente ou no servidor
  const isClient = typeof window !== 'undefined';
  
  // Obtém o token atual (da memória ou do localStorage)
  let token = options.token || getToken();
  
  // Verifica se o token está expirado
  if (token && isClient && isTokenExpired(token)) {
    try {
      // Tenta atualizar o token
      token = await refreshAccessToken();
    } catch (refreshError) {
      // Se falhar na atualização, redireciona para login
      if (typeof window !== 'undefined') {
        // Verifica se estamos na área de admin para redirecionar para o login correto
        const isAdminPath = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin/login' : '/login';
      }
      throw refreshError;
    }
  }
  
  // Prepara os headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Adiciona o token de autorização se disponível
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Adiciona token CSRF se disponível
  const csrfToken = isClient ? (document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] : null;
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  // Prepara o corpo da requisição
  const body = options.data ? JSON.stringify(options.data) : options.body;
  
  try {
    // Faz a requisição
    const response = await fetch(`${endpoint}`, {
      ...options,
      headers,
      body,
      credentials: 'include', // Para enviar/receber cookies
    });
    
    // Verifica o content-type da resposta
    const contentType = response.headers.get('content-type');
    
    // Se a resposta não for JSON, trata de forma adequada
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }
      
      // Para respostas não-JSON bem-sucedidas, retornamos um objeto simples
      return { success: true } as unknown as T;
    }
    
    // Lê a resposta como JSON
    const data = await response.json();
    
    // Se a resposta não for bem-sucedida, lança um erro com informações detalhadas
    if (!response.ok) {
      const apiError: ApiError = {
        error: data.error || 'Erro desconhecido',
        code: data.code,
        message: data.message || `${response.status}: ${response.statusText}`
      };
      
      throw apiError;
    }
    
    // Retorna os dados para requisições bem-sucedidas
    return data as T;
  } catch (error) {
    // Rethrow de erros já tratados (ApiError)
    if ((error as ApiError)?.error) {
      throw error;
    }
    
    // Cria um erro padronizado para erros não tratados
    throw {
      error: 'Erro na requisição',
      message: error instanceof Error ? error.message : String(error),
      code: 'REQUEST_ERROR'
    } as ApiError;
  }
}

/**
 * Verifica se o usuário atual está autenticado
 * @returns Booleano indicando se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  // Verifica se estamos no cliente
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Verifica se existe um token em memória ou no localStorage
  return !!getToken() || !!localStorage.getItem('refresh_token');
}

/**
 * Verifica se o token atual é válido fazendo uma requisição ao servidor
 * @returns Promise com booleano indicando se o token é válido
 */
export async function validateToken(): Promise<boolean> {
  try {
    if (!isAuthenticated()) {
      return false;
    }
    
    await authApi.validate();
    return true;
  } catch {
    // Se ocorrer algum erro, o token é considerado inválido
    return false;
  }
}

/**
 * Utilitários para operações de documentos
 */
export const documentsApi = {
  /**
   * Obtém a lista de documentos
   */
  getAll: () => apiRequest<any[]>('/api/documents'),
  
  /**
   * Faz upload de um documento
   * @param data - Dados do documento
   */
  upload: (data: any) => apiRequest<any>('/api/documents', {
    method: 'POST',
    data,
  }),
  
  /**
   * Remove um documento
   * @param id - ID do documento
   */
  delete: (id: string) => apiRequest<any>(`/api/documents/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Utilitários para operações de autenticação
 */
export const authApi = {
  /**
   * Realiza login
   * @param credentials - Credenciais (email e senha)
   */
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      // Chamamos a API sem tentar manipular eventos de forma incorreta
      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        data: credentials,
        credentials: 'include', // Para enviar/receber cookies
      });
      
      // Salva os dados de autenticação
      saveAuthData(data);
      
      return data;
    } catch (error) {
      console.error('Erro durante login na API:', error);
      // Re-lançar o erro para ser tratado pelo componente
      throw error;
    }
  },
  
  /**
   * Registra um novo usuário
   * @param userData - Dados do usuário
   */
  register: (userData: { email: string; password: string; name?: string; role?: 'user' | 'admin' }) => 
    apiRequest<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      data: userData,
    }),
  
  /**
   * Realiza logout
   */
  logout: async (): Promise<void> => {
    try {
      // Chama a API para invalidar o refresh token no servidor
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    } finally {
      // Mesmo se a API falhar, limpa os dados locais
      clearAuthData();
    }
  },
    
  /**
   * Obtém informações do usuário atual
   */
  getCurrentUser: () => apiRequest<{ user: User }>('/api/auth/me'),
  
  /**
   * Valida o token atual
   */
  validate: () => apiRequest<{ valid: boolean; user?: User }>('/api/auth/validate'),
  
  /**
   * Lista todos os usuários (apenas para administradores)
   */
  listUsers: () => apiRequest<{ users: User[] }>('/api/auth/users'),
  
  /**
   * Verifica se o usuário é administrador
   */
  checkAdmin: () => apiRequest<{ message: string; role: string }>('/api/auth/admin-check'),
};

/**
 * Utilitários para operações de upload de arquivos
 */
export const uploadsApi = {
  /**
   * Faz upload de um arquivo
   * @param file - Arquivo a ser enviado
   */
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Adiciona token CSRF se disponível
    const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload do arquivo');
    }
    
    return response.json();
  },
  
  /**
   * Lista todos os arquivos (apenas para administradores)
   */
  listFiles: () => apiRequest<{ files: string[] }>('/api/uploads'),
  
  /**
   * Remove um arquivo (apenas para administradores)
   * @param filename - Nome do arquivo a ser removido
   */
  deleteFile: (filename: string) => apiRequest<{ success: boolean }>(`/api/uploads/${filename}`, {
    method: 'DELETE',
  }),
};