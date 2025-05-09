'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Image from 'next/image';

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

  // Lógica de proteção e redirecionamento do layout admin
  useEffect(() => {
    if (!isLoading) {
      if (isAdminLoginPage && user && user.role === 'admin') {
        router.replace('/admin/documentos');
        return;
      }
      if (!isAdminLoginPage && !user) {
        router.replace('/admin/login');
        return;
      }
      if (!isAdminLoginPage && user && !isAdmin) {
        router.replace('/access-denied');
        return;
      }
    }
  }, [router, user, isAdmin, isLoading, isAdminLoginPage]);

  if (isAdminLoginPage) {
    return <>{children}</>;
  }
  
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
      ? 'bg-[var(--primary)] text-white' 
      : 'text-gray-700 hover:bg-gray-100';
  };

  // Se chegou aqui, é porque o usuário está autenticado como admin
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="admin-mobile-header lg:hidden w-full sticky top-0 z-20">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-700 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center">
          <div className="relative h-8 w-32 mr-2">
            <Image
              src="/images/Logo_Vale_Verde.png"
              alt="Logo Vale Verde"
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <span className="font-bold text-gray-800">Admin</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 admin-sidebar ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:z-10 lg:shrink-0 border-r border-gray-200`}
        >
          {/* Close button for mobile */}
          <div className="h-full flex flex-col">
            <div className="p-4 sm:p-6 flex-grow">
              <div className="admin-logo-container mb-6 sm:mb-8">
                <div className="flex flex-col items-center w-full">
                  <div className="relative h-12 sm:h-16 w-40 sm:w-48 mb-2">
                    <Image
                      src="/images/Logo_Vale_Verde.png"
                      alt="Logo Vale Verde"
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 192px"
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                  <div className="h-0.5 w-16 bg-[var(--accent)] mb-1 rounded"></div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">Painel Administrativo</h2>
                </div>
                {isMobileSidebarOpen && (
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700 absolute top-4 right-4"
                    aria-label="Close sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="mt-4 sm:mt-6 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Olá, {user?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Administrador</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {/* Dashboard oculto conforme solicitado */}
                <div style={{ display: 'none' }}>
                  <Link
                    href="/admin"
                    className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                </div>
                <Link
                  href="/admin/documentos"
                  className={`nav-link ${pathname === '/admin/documentos' || pathname.startsWith('/admin/documentos/') ? 'active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Gerenciar Documentos</span>
                </Link>
                {/* Hidden menu items */}
                <div style={{ display: 'none' }}>
                  <Link
                    href="/admin/paginas"
                    className={`nav-link ${pathname === '/admin/paginas' || pathname.startsWith('/admin/paginas/') ? 'active' : ''}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span>Editar Páginas</span>
                  </Link>
                </div>
                <Link
                  href="/admin/usuarios"
                  className={`nav-link ${pathname === '/admin/usuarios' || pathname.startsWith('/admin/usuarios/') ? 'active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Usuários</span>
                </Link>
                <Link
                  href="/admin/configuracoes"
                  className={`nav-link ${pathname === '/admin/configuracoes' || pathname.startsWith('/admin/configuracoes/') ? 'active' : ''}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Configurações</span>
                </Link>
              </nav>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <Link 
                href="/" 
                className="admin-btn admin-btn-secondary w-full justify-start mb-4"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="ml-2">Voltar ao Site</span>
              </Link>
              <button
                onClick={logout}
                className="admin-btn admin-btn-danger w-full justify-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="ml-2">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto admin-content-wrapper p-3 sm:p-4 lg:p-6">
            <div className="admin-content-container mb-4 sm:mb-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}