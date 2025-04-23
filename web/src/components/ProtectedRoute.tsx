'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  propertyId?: string;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  propertyId 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAdmin, isLoading, token } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Lógica de autorização para rota protegida
  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace('/login');
      setIsAuthorized(false);
      return;
    }
    if (isAdmin) {
      setIsAuthorized(true);
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace('/access-denied');
      setIsAuthorized(false);
      return;
    }
    if (propertyId && user?.properties) {
      const hasAccess = user.properties.includes(propertyId);
      if (!hasAccess) {
        router.replace('/access-denied');
        setIsAuthorized(false);
        return;
      }
    }
    setIsAuthorized(true);
  }, [isLoading, token, isAdmin, adminOnly, propertyId, user, router]);

  // Mostrar loading enquanto verifica a autenticação
  if (isLoading || isAuthorized === null) {
    return <Loading />;
  }

  // Não renderizar nada se não estiver autorizado
  if (!isAuthorized) {
    return null;
  }

  // Se estiver autorizado, renderizar o conteúdo
  return <>{children}</>;
} 