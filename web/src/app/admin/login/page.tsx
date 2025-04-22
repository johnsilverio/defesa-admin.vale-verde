'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState<null | { status?: number; message?: string }>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { login, isLoading, user, logout } = useAuth();
  const router = useRouter();

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  // Verificar se o usuário foi redirecionado por expiração de sessão
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionExpired = urlParams.get('session_expired');
      
      if (sessionExpired === 'true') {
        setError('Sua sessão expirou. Por favor, faça login novamente.');
      }
    }
  }, []);

  // Função para validar inputs
  const validateInputs = () => {
    if (!email.trim()) {
      setValidationError('O campo de email é obrigatório.');
      return false;
    }
    
    if (!password.trim()) {
      setValidationError('O campo de senha é obrigatório.');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  // Função para lidar com o login
  const handleLogin = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Se recebemos um evento, prevenimos qualquer comportamento padrão
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Impede processamento durante carregamento
    if (isLoading) return;
    
    // Limpa mensagens de erro anteriores
    setError('');
    setValidationError('');
    setApiError(null);
    
    // Valida os campos de entrada
    if (!validateInputs()) {
      return;
    }

    try {
      console.log('Tentando login administrativo com:', email);
      
      // If already logged in as a regular user, log them out first
      if (user && user.role !== 'admin') {
        console.log('Usuário logado como usuário regular, fazendo logout primeiro');
        await logout();
      }

      // Then perform the login
      const result = await login(email, password);
      console.log('Resultado do login:', result);
      
      if (result.success) {
        // Only redirect to admin if the user is an admin
        if (result.role === 'admin') {
          console.log('Login administrativo bem-sucedido, redirecionando para /admin');
          
          // Salvar estado de login antes de redirecionar
          localStorage.setItem('adminAuthenticated', 'true');
          
          // Redirecionar usando router
          router.push('/admin');
        } else {
          setError('Você não tem permissão de administrador.');
        }
      } else {
        // Definir mensagem de erro e não redirecionar
        setError(result.message || 'Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (err) {
      console.error('Erro detalhado de login:', err);
      
      // Tentar extrair informações mais detalhadas do erro
      let errorMessage = 'Ocorreu um erro durante o login. Verifique sua conexão com o servidor.';
      let errorStatus: number | undefined = undefined;
      
      if (err instanceof Error) {
        try {
          // Tenta interpretar se há um erro de API detalhado
          const apiErrorObj = JSON.parse(err.message);
          errorMessage = apiErrorObj.error || apiErrorObj.message || err.message;
          errorStatus = apiErrorObj.status;
        } catch {
          errorMessage = err.message;
        }
      }
      
      // Definir mensagem de erro e informações de diagnóstico
      setError(errorMessage);
      setApiError({ status: errorStatus, message: errorMessage });
    }
  };

  // Manipulador para a tecla Enter nos campos
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleLogin(e);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pattern-dots pattern-slate-300 pattern-bg-white pattern-size-4 opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md px-6 py-10 mx-auto">
        <div className="admin-login-container">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative h-20 w-56 admin-login-logo">
                <Image
                  src="/images/Logo_Vale_Verde.png"
                  alt="Logo Vale Verde"
                  fill
                  sizes="(max-width: 768px) 100vw, 224px"
                  style={{ objectFit: 'contain' }}
                  priority
                  className="animate-fadeIn"
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
            <div className="admin-login-divider"></div>
            <p className="mt-2 text-sm text-gray-600 mb-6">
              Acesso restrito para administradores
            </p>
          </div>

          <div className="space-y-6">
            {(error || validationError) && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded animate-fadeIn">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {validationError || error}
                </p>
                {apiError && (
                  <button 
                    type="button" 
                    className="mt-2 text-xs text-red-800 underline"
                    onClick={() => setShowDiagnostic(!showDiagnostic)}
                  >
                    {showDiagnostic ? 'Ocultar diagnóstico' : 'Mostrar diagnóstico'}
                  </button>
                )}
                {showDiagnostic && apiError && (
                  <div className="mt-2 text-xs p-2 bg-red-50 rounded border border-red-300">
                    <p>Status: {apiError.status || 'Desconhecido'}</p>
                    <p>Detalhes: {apiError.message || 'Nenhum detalhe disponível'}</p>
                    <p className="mt-1">Verifique se a API está rodando em: http://localhost:4000</p>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
                  placeholder="seu.email@valeverdeambiental.com.br"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="admin-btn admin-btn-primary w-full py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}