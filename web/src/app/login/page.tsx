'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

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
    
    // Valida os campos de entrada
    if (!validateInputs()) {
      return;
    }

    try {
      console.log('Tentando login de usuário com:', email);
      const result = await login(email, password);
      console.log('Resultado do login:', result);
      
      if (result.success) {
        // Redirect to home page (Início) after login
        router.replace('/');
      } else {
        // Definir mensagem de erro e não redirecionar
        setError(result.message);
      }
    } catch (err) {
      console.error('Erro detalhado de login:', err);
      
      // Extrair mensagem de erro mais detalhada quando possível
      let errorMessage = 'Ocorreu um erro durante o login. Por favor tente novamente.';
      
      if (err instanceof Error) {
        try {
          // Tenta interpretar se há um erro de API detalhado
          const apiErrorObj = JSON.parse(err.message);
          errorMessage = apiErrorObj.error || apiErrorObj.message || err.message;
        } catch {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-light)]">
      <div className="relative w-full max-w-md overflow-hidden">
        <div className="absolute inset-0 bg-[var(--primary-green)] opacity-5 z-0"></div>
        
        <div className="relative z-10 p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative h-20 w-48">
                <Image
                  src="/images/Logo_Vale_Verde.png"
                  alt="Logo Vale Verde"
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  style={{ objectFit: 'contain' }}
                  priority
                  className="animate-fadeIn"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--dark-green)]">Área Restrita</h1>
            <p className="mt-2 text-sm text-gray-600">
              Entre com suas credenciais para acessar o conteúdo
            </p>
          </div>

          <div className="space-y-5">
            {(error || validationError) && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md animate-fadeIn">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {validationError || error}
                </p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-transparent"
                  placeholder="seu@email.com"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-white bg-[var(--primary-green)] hover:bg-[var(--dark-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)] transition-colors duration-200 font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </div>
          </div>

          {/* Seção de credenciais removida conforme solicitado */}
        </div>
      </div>
    </main>
  );
}