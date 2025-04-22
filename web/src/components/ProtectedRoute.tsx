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

  // Verificar se o usuário está autenticado e tem permissão para acessar a página
  useEffect(() => {
    // Verificar se ainda está carregando
    if (isLoading) {
      return;
    }

    // Se não tiver token, não está autenticado
    if (!token) {
      console.log('Usuário não autenticado, redirecionando para login');
      router.replace('/login');
      setIsAuthorized(false);
      return;
    }

    // Se for administrador, tem acesso a tudo
    if (isAdmin) {
      console.log('Usuário é administrador, acesso permitido');
      setIsAuthorized(true);
      return;
    }

    // Se a rota requer admin e o usuário não é admin
    if (adminOnly && !isAdmin) {
      console.log('Acesso negado: rota requer privilégios de administrador');
      router.replace('/access-denied');
      setIsAuthorized(false);
      return;
    }

    // Se a rota requer uma propriedade específica
    if (propertyId && user?.properties) {
      // Verificar se o usuário tem acesso à propriedade específica
      const hasAccess = user.properties.includes(propertyId);
      if (!hasAccess) {
        console.log(`Usuário não tem acesso à propriedade: ${propertyId}`);
        router.replace('/access-denied');
        setIsAuthorized(false);
        return;
      }
    }

    // Se passou por todas as verificações, está autorizado
    setIsAuthorized(true);
  }, [router, user, isAdmin, isLoading, adminOnly, propertyId, token]);

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