'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAdmin } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isAdminLoginPage = pathname === '/admin/login';

  // Este useEffect é chamado consistentemente em toda renderização
  useEffect(() => {
    // Verificar se o usuário está autenticado como admin e redirecionar adequadamente
    if (!isLoading) {
      // Se estiver na página de login e for admin, redirecionar para o dashboard
      if (isAdminLoginPage && user && user.role === 'admin') {
        console.log("Admin já autenticado, redirecionando para o dashboard");
        router.replace('/admin');
        return;
      }
      
      // Se não estiver na página de login e não for admin, redirecionar para o login
      if (!isAdminLoginPage && !user) {
        console.log("Usuário não autenticado, redirecionando para login");
        router.replace('/admin/login');
        return;
      }
      
      // Se não estiver na página de login e não for admin, redirecionar para página de acesso negado
      if (!isAdminLoginPage && user && !isAdmin) {
        console.log("Usuário autenticado não é admin, redirecionando para acesso negado");
        router.replace('/access-denied');
        return;
      }
    }
  }, [router, user, isAdmin, isLoading, isAdminLoginPage]);

  // Renderização condicional APÓS todos os hooks serem chamados
  if (isAdminLoginPage) {
    return <>{children}</>;
  }
  
  // Show loading while checking authentication status
  if (isLoading) {
    return <Loading />;
  }
  
  // Se não estiver autenticado como admin e não estiver na página de login, mostre loading
  // O useEffect acima já vai redirecionar para a página correta
  if (!isAdmin && !isAdminLoginPage) {
    return <Loading />;
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/') 
      ? 'bg-[var(--primary-green)] text-white' 
      : '';
  };

  // Se chegou aqui, é porque o usuário está autenticado como admin
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white p-4 flex items-center justify-between shadow z-20">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-[var(--dark-green)]"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-[var(--dark-green)]">Admin - Vale Verde</span>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:z-10 lg:shrink-0`}
      >
        {/* Close button for mobile */}
        <div className="h-full flex flex-col">
          <div className="p-6 flex-grow">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--dark-green)]">Vale Verde</h2>
              {isMobileSidebarOpen && (
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden text-gray-500"
                  aria-label="Close sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-gray-600 mb-6">Painel Administrativo</p>
            
            <div className="space-y-2 mb-6">
              <div className="p-3 bg-[var(--light-green)] rounded-lg">
                <p className="font-medium">Olá, {user?.name}</p>
                <p className="text-sm text-gray-600">Administrador</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin')} hover:bg-[var(--light-green)]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/admin/documentos"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin/documentos')} hover:bg-[var(--light-green)]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gerenciar Documentos
              </Link>
              <Link
                href="/admin/paginas"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin/paginas')} hover:bg-[var(--light-green)]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Editar Páginas
              </Link>
              <Link
                href="/admin/usuarios"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin/usuarios')} hover:bg-[var(--light-green)]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuários
              </Link>
              <Link
                href="/admin/configuracoes"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/admin/configuracoes')} hover:bg-[var(--light-green)]`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configurações
              </Link>
            </nav>
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <Link href="/" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Site
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}