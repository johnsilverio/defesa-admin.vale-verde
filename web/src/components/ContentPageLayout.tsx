'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ContentPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export default function ContentPageLayout({ 
  children, 
  title, 
  subtitle,
  breadcrumbs 
}: ContentPageLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth state
  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero py-14 md:py-18 text-center relative mb-6">
          {/* Hero pattern background */}
          <div className="hero-pattern"></div>
          
          <div className="container relative z-10 flex flex-col justify-center items-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fadeIn text-balance text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slideUp text-white text-pretty">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-black bg-opacity-30 z-[1]"></div>
          
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[var(--primary-dark)] to-transparent z-[2]"></div>
        </section>
        
        <div className="container py-8 md:py-10 mt-4">
          {/* Optional breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="inline-flex items-center">
                    {index > 0 && (
                      <svg className="w-3 h-3 mx-2 text-[var(--neutral-400)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                      </svg>
                    )}
                    <a 
                      href={crumb.href} 
                      className={`inline-flex items-center ${index === breadcrumbs.length - 1 ? 'text-[var(--text-secondary)] font-medium' : 'text-[var(--primary)] hover:text-[var(--primary-light)]'}`}
                    >
                      {index === 0 && (
                        <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                          <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                        </svg>
                      )}
                      {crumb.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          {/* Main content */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow-md)] p-6 md:p-8 border border-[var(--border)] card-accent">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 