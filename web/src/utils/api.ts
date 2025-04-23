// Utilitário para requisições à API
// Em produção, usamos caminhos relativos que serão redirecionados pelo Vercel
// Em desenvolvimento, usamos a URL completa definida em .env.local
const API_URL = process.env.NEXT_PUBLIC_ENV === 'production' 
  ? '' // Caminho vazio para usar URLs relativas em produção (com rewrite do Vercel)
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

if (ENV === 'development' && typeof window !== 'undefined') {
  console.log(`API configurada para: ${API_URL} (${ENV})`);
}

interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

export interface User {
  id: number;
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

let inMemoryToken: string | null = null;
let refreshTokenInProgress: Promise<string> | null = null;

export function setToken(token: string | null): void {
  inMemoryToken = token;
}

export function getToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }
  
  // Se não estiver na memória, tenta do localStorage (para persistência entre recarregamentos)
  if (typeof window !== 'undefined') {
    // Primeiro tenta 'auth_token' que é usado pelo AuthContext
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      inMemoryToken = authToken;
      return authToken;
    }
    
    // Como fallback, tenta o nome antigo 'token'
    const token = localStorage.getItem('token');
    if (token) {
      inMemoryToken = token;
      return token;
    }
  }
  
  return null;
}

export function saveAuthData(data: AuthResponse): void {
  inMemoryToken = data.accessToken;
  if (typeof window !== 'undefined') {
    // Salvar o token com o mesmo nome usado pelo AuthContext
    localStorage.setItem('auth_token', data.accessToken);
    
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
      // Também salvar com o nome usado pelo AuthContext
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

function clearAuthData(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    // Limpar todos os possíveis locais de armazenamento do token
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

// Retorna true se o token JWT estiver expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() >= expiry;
  } catch (e) {
    return true;
  }
}

// Atualiza o token de acesso usando o refresh token
async function refreshAccessToken(): Promise<string> {
  if (refreshTokenInProgress) {
    return refreshTokenInProgress;
  }
  refreshTokenInProgress = (async () => {
    try {
      // Tenta ambos os nomes de chaves para o refresh token
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('Refresh token não disponível');
      
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        clearAuthData();
        throw new Error('Falha ao atualizar o token');
      }
      
      const data: RefreshResponse = await response.json();
      inMemoryToken = data.accessToken;
      
      // Salva com ambos os nomes para garantir compatibilidade
      localStorage.setItem('auth_token', data.accessToken);
      
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data.accessToken;
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      refreshTokenInProgress = null;
    }
  })();
  return refreshTokenInProgress;
}

// Requisição autenticada para a API (com suporte a refresh token)
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
    const response = await fetch(`${API_URL}${endpoint}`, {
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
        message: data.message
      };
      
      // Tratamento específico para tokens expirados
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED' && isClient) {
        try {
          // Tenta atualizar o token e refazer a requisição
          const newToken = await refreshAccessToken();
          
          // Refaz a requisição original com o novo token
          const newOptions = {
            ...options,
            token: newToken
          };
          
          return apiRequest<T>(endpoint, newOptions);
        } catch (refreshError) {
          // Se falhar no refresh, limpa dados e redireciona
          clearAuthData();
          
          if (typeof window !== 'undefined') {
            // Verifica se estamos na área de admin para redirecionar para o login correto
            const isAdminPath = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminPath ? '/admin/login' : '/login';
          }
          
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
      }
      
      // Para outros erros 401 (Unauthorized), pode ser que o token seja inválido
      if (response.status === 401 && isClient) {
        // Limpa dados de autenticação
        clearAuthData();
        
        // Redireciona para a página de login apropriada
        if (typeof window !== 'undefined') {
          // Verifica se estamos na área de admin para redirecionar para o login correto
          const isAdminPath = window.location.pathname.startsWith('/admin');
          window.location.href = isAdminPath ? '/admin/login' : '/login';
        }
      }
      
      throw new Error(JSON.stringify(apiError));
    }
    
    return data;
  } catch (error) {
    // Captura e relança erros de rede ou outros erros não relacionados à API
    if (error instanceof Error) {
      console.error('API request error:', error.message);
      throw error;
    }
    
    throw new Error('Ocorreu um erro desconhecido na comunicação com o servidor');
  }
}

function isAuthenticated(): boolean {
  // Verifica se estamos no cliente
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Verifica se existe um token em memória ou no localStorage
  return !!getToken() || !!localStorage.getItem('refreshToken');
}

async function validateToken(): Promise<boolean> {
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
  getAll: () => apiRequest<any[]>('/api/documents'),
  upload: (data: any) => apiRequest<any>('/api/documents', {
    method: 'POST',
    data,
  }),
  delete: (id: string) => apiRequest<any>(`/api/documents/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Utilitários para operações de autenticação
 */
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        data: credentials,
        credentials: 'include',
      });
      
      saveAuthData(data);
      
      return data;
    } catch (error) {
      console.error('Erro durante login na API:', error);
      throw error;
    }
  },
  register: (userData: { email: string; password: string; name?: string; role?: 'user' | 'admin' }) => 
    apiRequest<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      data: userData,
    }),
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    } finally {
      clearAuthData();
    }
  },
  getCurrentUser: () => apiRequest<{ user: User }>('/api/auth/me'),
  validate: () => apiRequest<{ valid: boolean; user?: User }>('/api/auth/validate'),
  listUsers: () => apiRequest<{ users: User[] }>('/api/auth/users'),
  checkAdmin: () => apiRequest<{ message: string; role: string }>('/api/auth/admin-check'),
};

/**
 * Utilitários para operações de upload de arquivos
 */
export const uploadsApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
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
  listFiles: () => apiRequest<{ files: string[] }>('/api/uploads'),
  deleteFile: (filename: string) => apiRequest<{ success: boolean }>(`/api/uploads/${filename}`, {
    method: 'DELETE',
  }),
};