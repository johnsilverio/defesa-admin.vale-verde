'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'John');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de salvamento (mock)
    setSavedMessage('Configurações salvas com sucesso!');
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--dark-green)] mb-6">Configurações da Conta</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          {savedMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
              {savedMessage}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input 
              type="text" 
              id="name" 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">O email não pode ser alterado.</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="notifications" className="flex items-center">
              <input 
                type="checkbox" 
                id="notifications" 
                className="mr-2 h-4 w-4 text-[var(--primary-green)]"
                defaultChecked
              />
              <span className="text-sm text-gray-700">Receber notificações por email</span>
            </label>
          </div>
          
          <div className="mt-8">
            <button 
              type="submit"
              className="px-6 py-3 bg-[var(--primary-green)] text-white rounded-md hover:bg-[var(--dark-green)] transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 