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

  // Redireciona admin autenticado para o dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  // Validação dos campos do formulário
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

  // Lógica de autenticação do admin
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-48">
              <Image
                src="/images/Logo_Vale_Verde.png"
                alt="Logo Vale Verde"
                fill
                sizes="(max-width: 768px) 100vw, 192px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--dark-green)]">Painel Administrativo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Acesso restrito para administradores
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {(error || validationError) && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md animate-fadeIn">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[var(--primary-green)] hover:bg-[var(--dark-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)] transition-colors duration-200 disabled:opacity-70"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>

        {/* Credenciais de administrador removidas conforme solicitado */}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-center">
            <a 
              href="/"
              className="text-sm text-[var(--dark-green)] hover:text-[var(--primary-green)] transition-colors"
            >
              Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}