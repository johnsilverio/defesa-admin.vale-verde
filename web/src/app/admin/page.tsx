'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  // Redirecionar para a página de documentos
  useEffect(() => {
    router.replace('/admin/documentos');
  }, [router]);
  
  // Este componente não renderiza nada, apenas redireciona
  return null;
} 