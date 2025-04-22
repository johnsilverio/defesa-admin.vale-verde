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
    <header className={`bg-white fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md backdrop-blur-sm bg-white/95' : ''}`}>
      <div className="container flex justify-between items-center py-4">
        {/* Logo */}
        <div className="h-12">
          <Link href="/" className="block h-full">
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
          <nav className="hidden md:block mr-8">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/" 
                  className={`nav-link ${isActive('/')}`}
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  href="/historico" 
                  className={`nav-link ${isActive('/historico')}`}
                >
                  Histórico
                </Link>
              </li>
              <li>
                <Link 
                  href="/inconsistencias" 
                  className={`nav-link ${isActive('/inconsistencias')}`}
                >
                  Inconsistências
                </Link>
              </li>
              <li>
                <Link 
                  href="/ocupacao" 
                  className={`nav-link ${isActive('/ocupacao')}`}
                >
                  Ocupação
                </Link>
              </li>
              <li>
                <Link 
                  href="/fundamentos" 
                  className={`nav-link ${isActive('/fundamentos')}`}
                >
                  Fundamentos Jurídicos
                </Link>
              </li>
              <li>
                <Link 
                  href="/documentos" 
                  className={`nav-link ${isActive('/documentos')}`}
                >
                  Documentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/linha-do-tempo" 
                  className={`nav-link ${isActive('/linha-do-tempo')}`}
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
              className="flex items-center space-x-2 text-[var(--dark-green)] hover:text-[var(--primary-green)] transition-colors px-3 py-2 rounded-md hover:bg-[var(--light-green)]"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <span className="font-medium">{displayName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-20 animate-fadeIn">
                <Link 
                  href="/configuracoes"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[var(--light-green)] hover:text-[var(--dark-green)]"
                >
                  Configurações
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[var(--light-green)] hover:text-[var(--dark-green)]"
                  >
                    Painel Administrativo
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu toggle */}
          <div 
            className="flex flex-col justify-between w-7 h-5 cursor-pointer md:hidden ml-4"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`h-0.5 w-full bg-[var(--text-dark)] transition-all transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-[var(--text-dark)] transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`h-0.5 w-full bg-[var(--text-dark)] transition-all transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div 
        className={`md:hidden bg-white shadow-inner overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}
        id="mobile-menu"
      >
        <nav className="container py-2">
          <ul className="flex flex-col">
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
            </li>
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/historico" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/historico')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Histórico
              </Link>
            </li>
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/inconsistencias" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/inconsistencias')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inconsistências
              </Link>
            </li>
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/ocupacao" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/ocupacao')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Ocupação
              </Link>
            </li>
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/fundamentos" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/fundamentos')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Fundamentos Jurídicos
              </Link>
            </li>
            <li className="border-b border-gray-100 py-2">
              <Link 
                href="/documentos" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/documentos')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Documentos
              </Link>
            </li>
            <li className="py-2">
              <Link 
                href="/linha-do-tempo" 
                className={`block py-2 font-medium hover:text-[var(--primary-green)] ${isActive('/linha-do-tempo')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Linha do Tempo
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 