'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDenied() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <svg xmlns="http:www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2M3 4h18v16H3V4z" />
        </svg>
        
        <h1 className="mt-4 text-2xl font-bold text-red-600">Acesso Negado</h1>
        
        <p className="mt-2 text-gray-600">
          Desculpe, {user?.name}. Você não tem permissão para acessar esta página.
        </p>
        
        <div className="mt-6">
          <Link href="/" className="inline-block px-4 py-2 bg-[var(--primary-green)] text-white font-medium rounded-md hover:bg-[var(--dark-green)] transition-colors">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
} 