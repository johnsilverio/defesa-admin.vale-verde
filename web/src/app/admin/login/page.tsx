'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, user, logout } = useAuth();
  const router = useRouter();

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // If already logged in as a regular user, log them out first
      if (user && user.role !== 'admin') {
        await logout();
      }

      // Then perform the login
      const result = await login(email, password);
      
      if (result.success) {
        // Only redirect to admin if the user is an admin
        if (result.role === 'admin') {
          router.push('/admin');
        } else {
          setError('Você não tem permissão de administrador.');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Por favor tente novamente.');
      console.error('Login error:', err);
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

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[var(--primary-green)] hover:bg-[var(--dark-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)] transition-colors duration-200"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            <span className="block mb-2">Admin: admin@example.com / admin123</span>
          </p>
        </div>
        
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