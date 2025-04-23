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
  const [showPassword, setShowPassword] = useState(false);
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
      const result = await login(email, password);
      
      if (result.success) {
        // Feedback visual de sucesso antes do redirecionamento
        setError('');
        setValidationError('');
        
        // Determinar para onde redirecionar com base no papel do usuário
        if (result.role === 'admin') {
          router.push('/admin');
        } else {
          // Usuários normais vão para a página inicial da propriedade
          router.push('/');
        }
      } else {
        // Definir mensagem de erro e não redirecionar
        console.error('Falha no login:', result.message);
        setError(result.message || 'Credenciais inválidas. Por favor, verifique seu email e senha.');
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <main>
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">
              <Image
                src="/images/Logo_Vale_Verde.png"
                alt="Logo Vale Verde"
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h1 className="login-title">Área Restrita</h1>
            <p className="login-subtitle">Entre com suas credenciais para acessar o conteúdo</p>
            <div className="login-divider"></div>
          </div>

          {(error || validationError) && (
            <div className="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{validationError || error}</span>
            </div>
          )}
          
          <div className="login-form">
            <div className="login-input-group">
              <label htmlFor="email">Email</label>
              <div className="login-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="login-input"
                placeholder="seu@email.com"
                aria-label="Email"
              />
            </div>
            
            <div className="login-input-group">
              <label htmlFor="password">Senha</label>
              <div className="login-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="login-input"
                placeholder="••••••••"
                aria-label="Senha"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="login-button"
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
      </main>
    </div>
  );
}