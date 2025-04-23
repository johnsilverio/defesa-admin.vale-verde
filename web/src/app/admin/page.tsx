'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  // Redireciona automaticamente para a página de documentos do admin
  useEffect(() => {
    router.replace('/admin/documentos');
  }, [router]);

  return null;
} 