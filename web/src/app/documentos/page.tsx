'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  
  // Refs e estados para o carrossel
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  
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

  // Atualiza o total de slides quando os documentos destacados são carregados
  useEffect(() => {
    const highlightedDocs = documents.filter(doc => doc.isHighlighted);
    // Calcula quantos slides vamos precisar baseado no número de documentos visíveis por vez
    const itemsPerView = 3; // Número de itens visíveis por vez
    setTotalSlides(Math.max(1, Math.ceil(highlightedDocs.length / itemsPerView)));
  }, [documents]);

  // Filter menu options based on available categories
  const filterCategories = [
    { id: 'all', name: 'Todos' },
    ...categories.map(cat => ({ id: cat._id, name: cat.name }))
  ];

  // Filter documents based on selected category
  const filteredDocuments = activeFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.category._id === activeFilter);
    
  // Get highlighted documents
  const highlightedDocuments = documents.filter(doc => doc.isHighlighted);

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
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16" 
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
      </div>
      <h3 className="empty-state-title">Nenhum documento disponível</h3>
      <p className="empty-state-text">Ainda não foram adicionados documentos a esta categoria.</p>
    </div>
  );
  
  // Function to render document card
  const renderDocumentCard = (doc: Document) => (
    <div 
      key={doc._id} 
      className={`document-card ${doc.isHighlighted ? 'document-card-highlighted' : ''}`}
      data-category={doc.category.slug}
    >
      {doc.isHighlighted && (
        <span className="document-tag document-tag-important">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L13.586 9H10a1 1 0 110-2h3.586l-2.293-2.293A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          Documento Crucial
        </span>
      )}
      <h3>{doc.title}</h3>
      <p>{doc.description}</p>
      <a 
        href={`/api/documents/${doc._id}/download`} 
        className={`btn ${doc.isHighlighted ? 'btn-primary' : 'btn-secondary'} w-full`}
        download={doc.originalFileName}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download
      </a>
    </div>
  );
  
  // Funções para controlar o carrossel
  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    
    setCurrentSlide(index);
    const slideWidth = carouselRef.current.offsetWidth;
    carouselRef.current.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
  };
  
  const nextSlide = () => {
    const newIndex = Math.min(currentSlide + 1, totalSlides - 1);
    scrollToSlide(newIndex);
  };
  
  const prevSlide = () => {
    const newIndex = Math.max(currentSlide - 1, 0);
    scrollToSlide(newIndex);
  };
  
  // Renderizar o carrossel de documentos destacados
  const renderHighlightedDocumentsCarousel = () => {
    if (highlightedDocuments.length === 0) return null;
    
    // Determinar se precisamos mostrar os controles de navegação
    const showControls = highlightedDocuments.length > 3;
    
    return (
      <section className="highlighted-documents-section">
        <h2 className="highlighted-documents-title">Documentos Destacados</h2>
        <p className="highlighted-documents-subtitle">
          Os documentos abaixo são particularmente relevantes para a defesa administrativa da Fazenda Brilhante:
        </p>
        
        <div className="carousel-container">
          <div 
            ref={carouselRef} 
            className="carousel-track"
          >
            {highlightedDocuments.map(doc => (
              <div key={doc._id} className="carousel-item">
                {renderDocumentCard(doc)}
              </div>
            ))}
          </div>
          
          {showControls && (
            <>
              <div className="carousel-controls">
                <button 
                  onClick={prevSlide} 
                  className="carousel-button" 
                  disabled={currentSlide === 0}
                  aria-label="Documento anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextSlide} 
                  className="carousel-button" 
                  disabled={currentSlide === totalSlides - 1}
                  aria-label="Próximo documento"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="carousel-dots">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  };

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
      {/* Filtros de documentos */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-[var(--primary-dark)] mb-4">Filtrar por Categoria</h2>
        <div className="filter-controls">
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
        categories.map(category => {
          const categoryId = category._id;
          const categoryName = category.name;
          const categoryDocs = documentsByCategory[categoryId] || [];
          
          return (
            <section key={categoryId} className="mb-10">
              <h2 className="text-xl font-bold text-[var(--primary-dark)] mb-4 pb-2 border-b border-[var(--neutral-200)]">
                {categoryName}
              </h2>
              {categoryDocs.length > 0 ? (
                <div className="document-grid">
                  {categoryDocs.map(renderDocumentCard)}
                </div>
              ) : (
                renderEmptyState()
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
            {filteredDocuments.map(renderDocumentCard)}
          </div>
        )
      )}
      
      {/* Mostrar mensagem de vazio se não houver documentos em nenhuma categoria quando o filtro for "todos" */}
      {activeFilter === 'all' && documents.length === 0 && renderEmptyState()}
      
      {/* Carrossel de documentos destacados (exibido no início da página) */}
      {activeFilter === 'all' && renderHighlightedDocumentsCarousel()}
    </ContentPageLayout>
  );
}