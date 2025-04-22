'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ContentPageLayout from '@/components/ContentPageLayout';
import { apiRequest } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  property: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  property: string;
  order: number;
}

export default function DocumentosPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, isAuthenticated } = useAuth();
  
  // Fetch documents from API
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        if (!isAuthenticated) {
          setError('Você precisa estar autenticado para visualizar documentos.');
          setLoading(false);
          return;
        }
        
        const [docsResponse, categoriesResponse] = await Promise.all([
          apiRequest<Document[]>('/api/documents'),
          apiRequest<Category[]>('/api/categories')
        ]);
        
        setDocuments(docsResponse);
        
        // Ordena as categorias pelo campo order e depois pelo nome
        const sortedCategories = categoriesResponse.sort((a: Category, b: Category) => {
          // Primeiro ordenamos pelo campo order
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          // Se o order for igual, ordenamos pelo nome
          return a.name.localeCompare(b.name);
        });
        
        setCategories(sortedCategories);
        setError('');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os documentos. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, token]);

  // Filter menu options based on available categories
  const filterCategories = [
    { id: 'all', name: 'Todos' },
    ...categories.map(cat => ({ id: cat._id, name: cat.name }))
  ];

  // Filter documents based on selected category
  const filteredDocuments = activeFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.category._id === activeFilter);

  // Group documents by category
  const documentsByCategory: { [key: string]: Document[] } = {};
  if (activeFilter === 'all') {
    categories.forEach(category => {
      documentsByCategory[category._id] = documents.filter(
        doc => doc.category._id === category._id
      );
    });
  } else {
    documentsByCategory[activeFilter] = filteredDocuments;
  }
  
  // Function to display a message when no documents are available
  const renderEmptyState = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-16 w-16 mx-auto text-gray-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum documento disponível</h3>
      <p className="text-gray-600 mb-4">
        Ainda não foram adicionados documentos a esta categoria.
      </p>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <ContentPageLayout 
        title="Biblioteca de Documentos"
        subtitle="Acesse todos os documentos relacionados à defesa administrativa"
      >
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-6">
          <p className="text-amber-700 font-medium">Você precisa estar logado para visualizar os documentos.</p>
          <Link href="/login" className="inline-block mt-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">
            Fazer login
          </Link>
        </div>
      </ContentPageLayout>
    );
  }

  if (loading) {
    return (
      <ContentPageLayout 
        title="Biblioteca de Documentos"
        subtitle="Carregando documentos..."
      >
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      </ContentPageLayout>
    );
  }

  if (error) {
    return (
      <ContentPageLayout 
        title="Biblioteca de Documentos"
        subtitle="Acesse todos os documentos relacionados à defesa administrativa da Fazenda Brilhante"
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout
      title="Biblioteca de Documentos"
      subtitle="Acesse todos os documentos relacionados à defesa administrativa da Fazenda Brilhante"
    >
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-6 text-center">Filtrar Documentos</h2>
        <div className="filter-controls justify-center">
          {filterCategories.map(category => (
            <button 
              key={category.id}
              className={`filter-button ${activeFilter === category.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {activeFilter === 'all' ? (
        // Display by category when showing all
        Object.keys(documentsByCategory).map(categoryId => {
          const categoryName = categories.find(c => c._id === categoryId)?.name || categoryId;
          const categoryDocs = documentsByCategory[categoryId];
          
          return (
            <section key={categoryId} className="mb-12">
              <h2 className="section-title text-center">{categoryName}</h2>
              
              {categoryDocs.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="document-grid">
                  {categoryDocs.map((doc: Document) => (
                    <div 
                      key={doc._id} 
                      className={`document-card ${doc.isHighlighted ? 'document-card-highlighted' : ''}`}
                      data-category={doc.category.slug}
                    >
                      <h3>{doc.title}</h3>
                      <p>
                        {doc.isHighlighted && <span className="font-bold text-[var(--primary-green)] block mb-1">DOCUMENTO CRUCIAL:</span>}
                        {doc.description}
                      </p>
                      <a 
                        href={`/api/documents/${doc._id}/download`} 
                        className={`btn ${doc.isHighlighted ? 'btn-primary' : 'btn-secondary'} w-full`}
                        download={doc.originalFileName}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })
      ) : (
        // Display filtered results without category headers
        filteredDocuments.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="document-grid">
            {filteredDocuments.map(doc => (
              <div 
                key={doc._id} 
                className={`document-card ${doc.isHighlighted ? 'document-card-highlighted' : ''}`}
                data-category={doc.category.slug}
              >
                <h3>{doc.title}</h3>
                <p>
                  {doc.isHighlighted && <span className="font-bold text-[var(--primary-green)] block mb-1">DOCUMENTO CRUCIAL:</span>}
                  {doc.description}
                </p>
                <a 
                  href={`/api/documents/${doc._id}/download`} 
                  className={`btn ${doc.isHighlighted ? 'btn-primary' : 'btn-secondary'} w-full`}
                  download={doc.originalFileName}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )
      )}
    </ContentPageLayout>
  );
} 