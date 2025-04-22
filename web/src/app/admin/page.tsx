'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    documents: 0,
    pages: 0,
    users: 0,
    lastUpdate: ''
  });

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For demonstration, we're using mock data
    setStats({
      documents: 23,
      pages: 7,
      users: 3,
      lastUpdate: new Date().toLocaleDateString('pt-BR')
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[var(--dark-green)]">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao painel administrativo da Fazenda Brilhante.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-[var(--light-green)] p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Documentos</p>
              <p className="text-2xl font-bold">{stats.documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-[var(--light-green)] p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Páginas</p>
              <p className="text-2xl font-bold">{stats.pages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-[var(--light-green)] p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Usuários</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-[var(--light-green)] p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Última Atualização</p>
              <p className="text-md font-bold">{stats.lastUpdate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-[var(--dark-green)] mb-4 pb-2 border-b border-gray-200">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/admin/documentos/novo" 
            className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-[var(--light-green)] p-3 mr-4 group-hover:bg-[var(--primary-green)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)] group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[var(--dark-green)] mb-2">Adicionar Documento</h3>
                <p className="text-gray-600 text-sm">Faça upload de um novo documento para o site.</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/paginas" 
            className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-[var(--light-green)] p-3 mr-4 group-hover:bg-[var(--primary-green)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)] group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[var(--dark-green)] mb-2">Editar Conteúdo</h3>
                <p className="text-gray-600 text-sm">Atualize o conteúdo das páginas do site.</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/usuarios" 
            className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-[var(--light-green)] p-3 mr-4 group-hover:bg-[var(--primary-green)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-[var(--dark-green)] group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[var(--dark-green)] mb-2">Gerenciar Usuários</h3>
                <p className="text-gray-600 text-sm">Adicione ou edite usuários com acesso ao painel.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-[var(--dark-green)] mb-4 pb-2 border-b border-gray-200">Atividade Recente</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Adicionado
                    </span>
                    <span className="ml-2">Documento: Defesa Administrativa.pdf</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date().toLocaleDateString('pt-BR')}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Editado
                    </span>
                    <span className="ml-2">Página: Histórico</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Admin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(Date.now() - 86400000).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Editado
                    </span>
                    <span className="ml-2">Página: Documentos</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Editor
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(Date.now() - 172800000).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 