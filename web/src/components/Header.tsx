'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Efeito de scroll para alterar visual do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Fechar o menu de usuário quando abrir o menu mobile
    if (!isMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  // Fecha o menu do usuário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName = user?.name || "John";

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-[var(--shadow-md)] backdrop-blur-sm bg-white/95' : 'bg-white'}`}>
      <div className="container flex justify-between items-center py-2.5 md:py-3">
        {/* Logo */}
        <div className="flex items-center h-12 px-2 py-1.5">
          <Link href="/" className="block transition-transform duration-300 hover:scale-105">
            <div style={{ height: '2.25rem', width: 'auto' }}>
              <Image
                src="/images/Logo_Vale_Verde.png"
                alt="Logo Vale Verde"
                width={1468}
                height={591}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>
        </div>
          
        {/* Navigation and User Controls */}
        <div className="flex items-center">
          {/* Main navigation - Desktop */}
          <nav className="hidden md:block mr-2 xl:mr-4">
            <ul className="flex space-x-0.5 md:space-x-1 xl:space-x-2 list-none p-0 m-0 items-center h-full">
              <li className="h-full flex items-center">
                <Link 
                  href="/" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Início
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/historico" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/historico')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Histórico
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/inconsistencias" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/inconsistencias')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Inconsistências
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/ocupacao" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/ocupacao')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Ocupação
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/fundamentos" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/fundamentos')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Fundamentos Jurídicos
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/documentos" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/documentos')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Documentos
                </Link>
              </li>
              <li className="h-full flex items-center">
                <Link 
                  href="/linha-do-tempo" 
                  className={`nav-link text-xs lg:text-sm ${isActive('/linha-do-tempo')}`}
                  style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }}
                >
                  Linha do Tempo
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* User Menu - Desktop only */}
          <div className="relative hidden md:block" ref={userMenuRef}>
            <button 
              onClick={toggleUserMenu}
              className="flex items-center space-x-1 text-[var(--primary-dark)] hover:text-[var(--primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--primary-50)] text-xs md:text-sm"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{displayName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-[var(--shadow-md)] z-20 animate-fadeIn border border-[var(--border)]">
                <Link 
                  href={isAdmin ? "/admin/configuracoes" : "/configuracoes"}
                  className="flex items-center px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-dark)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-dark)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Painel Administrativo
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-[var(--error)] hover:bg-red-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu toggle */}
          <div 
            className="flex justify-center items-center p-2 md:hidden cursor-pointer"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="flex flex-col justify-between w-6 h-5">
              <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div 
        className={`bg-white shadow-inner overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[calc(100vh-4rem)]' : 'max-h-0'}`}
        id="mobile-menu"
      >
        <nav className="container py-4">
          <ul className="list-none p-0 m-0 space-y-1">
            <li>
              <Link 
                href="/" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Início
              </Link>
            </li>
            <li>
              <Link 
                href="/historico" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/historico') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico
              </Link>
            </li>
            <li>
              <Link 
                href="/inconsistencias" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/inconsistencias') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Inconsistências
              </Link>
            </li>
            <li>
              <Link 
                href="/ocupacao" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/ocupacao') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Ocupação
              </Link>
            </li>
            <li>
              <Link 
                href="/fundamentos" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/fundamentos') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Fundamentos Jurídicos
              </Link>
            </li>
            <li>
              <Link 
                href="/documentos" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/documentos') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos
              </Link>
            </li>
            <li>
              <Link 
                href="/linha-do-tempo" 
                className={`flex items-center py-2 px-4 rounded-md ${isActive('/linha-do-tempo') ? 'bg-[var(--primary-50)] text-[var(--primary-dark)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--neutral-100)]'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Linha do Tempo
              </Link>
            </li>
          </ul>
          
          {/* User menu for mobile */}
          {user && (
            <div className="user-menu-mobile">
              <div className="user-info">
                <div className="user-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-[var(--primary-dark)]">{displayName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <div className="space-y-1 mt-2">
                <Link 
                  href={isAdmin ? "/admin/configuracoes" : "/configuracoes"}
                  className="flex items-center py-2 px-4 rounded-md text-[var(--text-primary)] hover:bg-[var(--neutral-100)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="flex items-center py-2 px-4 rounded-md text-[var(--text-primary)] hover:bg-[var(--neutral-100)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Painel Administrativo
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left py-2 px-4 rounded-md text-[var(--text-primary)] hover:bg-[var(--neutral-100)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}