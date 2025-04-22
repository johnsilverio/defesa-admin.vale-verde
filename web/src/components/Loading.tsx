import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-green)]"></div>
        <p className="mt-4 text-[var(--dark-green)] font-medium">Carregando...</p>
      </div>
    </div>
  );
} 