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
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  // Close user menu when clicking outside
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

  // Display user name or "John" as default
  const displayName = user?.name || "John";

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-[var(--shadow-md)] backdrop-blur-sm bg-white/95' : 'bg-white'}`}>
      <div className="container flex justify-between items-center py-3 md:py-4">
        {/* Logo */}
        <div className="h-12 md:h-10 lg:h-12 flex items-center">
          <Link href="/" className="block h-full transition-transform duration-300 hover:scale-105">
            <Image
              src="/images/Logo_Vale_Verde.png"
              alt="Logo Vale Verde"
              width={180}
              height={60}
              className="h-full w-auto"
              priority
            />
          </Link>
        </div>
          
        {/* Navigation and User Controls */}
        <div className="flex items-center">
          {/* Main navigation - Desktop */}
          <nav className="hidden md:block mr-2 lg:mr-4">
            <ul className="flex space-x-0.5 md:space-x-1 lg:space-x-2 list-none p-0 m-0 items-center">
              <li>
                <Link 
                  href="/" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/')}`}
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  href="/historico" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/historico')}`}
                >
                  Histórico
                </Link>
              </li>
              <li>
                <Link 
                  href="/inconsistencias" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/inconsistencias')}`}
                >
                  Inconsistências
                </Link>
              </li>
              <li>
                <Link 
                  href="/ocupacao" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/ocupacao')}`}
                >
                  Ocupação
                </Link>
              </li>
              <li>
                <Link 
                  href="/fundamentos" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/fundamentos')}`}
                >
                  Fundamentos Jurídicos
                </Link>
              </li>
              <li>
                <Link 
                  href="/documentos" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/documentos')}`}
                >
                  Documentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/linha-do-tempo" 
                  className={`nav-link text-xs md:text-sm lg:text-base flex items-center h-full ${isActive('/linha-do-tempo')}`}
                >
                  Linha do Tempo
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* User Menu - Desktop & Mobile */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={toggleUserMenu}
              className="flex items-center space-x-1 md:space-x-2 text-[var(--primary-dark)] hover:text-[var(--primary)] transition-colors px-2 md:px-3 py-1 md:py-2 rounded-md hover:bg-[var(--primary-50)] text-sm md:text-base"
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
                  href="/configuracoes"
                  className="flex items-center px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-dark)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
            className="flex flex-col justify-between w-6 md:w-7 h-4 md:h-5 cursor-pointer lg:hidden ml-2 md:ml-4"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`h-0.5 w-full bg-[var(--primary-dark)] transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div 
        className={`lg:hidden bg-white shadow-inner overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}
        id="mobile-menu"
      >
        <nav className="container py-4">
          <ul className="flex flex-col space-y-1">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
        </nav>
      </div>
    </header>
  );
} 