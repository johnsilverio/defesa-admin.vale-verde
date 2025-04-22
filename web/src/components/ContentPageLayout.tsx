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
}

export default function ContentPageLayout({ children, title, subtitle }: ContentPageLayoutProps) {
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
        <section className="hero py-14 text-center">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fadeIn">{title}</h1>
            {subtitle && <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slideUp">{subtitle}</p>}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30 z-[-1]"></div>
          <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-[var(--hero-bg)] to-transparent"></div>
        </section>
        <div className="container py-10">
          <div className="bg-white rounded-lg shadow-md p-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 