'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
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
  category: string;
  property: string;
  uploadedBy: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ImportantDocumentsCarousel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchHighlightedDocuments = async () => {
      try {
        setLoading(true);
        if (!token) {
          // Dados estáticos para exibição na página inicial
          const staticDocuments = [
            {
              _id: 'doc1',
              title: 'Defesa Administrativa Completa',
              description: 'Documento completo da defesa administrativa apresentada à FUNAI.',
              fileName: 'defesa_administrativa_fazenda_brilhante.pdf',
              originalFileName: 'defesa_administrativa_fazenda_brilhante.pdf',
              fileSize: 2500000,
              fileType: 'application/pdf',
              filePath: '/documentos/defesa_administrativa_fazenda_brilhante.pdf',
              category: 'defesa',
              property: 'fazenda-brilhante',
              uploadedBy: 'admin',
              isHighlighted: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: 'doc2',
              title: 'Matrícula Originária',
              description: 'Matrícula originária da Fazenda Brilhante, comprovando a cadeia dominial.',
              fileName: 'matricula_originaria.pdf',
              originalFileName: 'matricula_originaria.pdf',
              fileSize: 1500000,
              fileType: 'application/pdf',
              filePath: '/documentos/matricula_originaria.pdf',
              category: 'matricula',
              property: 'fazenda-brilhante',
              uploadedBy: 'admin',
              isHighlighted: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: 'doc3',
              title: 'Ofício FUNAI',
              description: 'Ofício da FUNAI notificando sobre os estudos demarcatórios.',
              fileName: 'oficio_funai.pdf',
              originalFileName: 'oficio_funai.pdf',
              fileSize: 1000000,
              fileType: 'application/pdf',
              filePath: '/documentos/oficio_funai.pdf',
              category: 'funai',
              property: 'fazenda-brilhante',
              uploadedBy: 'admin',
              isHighlighted: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              _id: 'doc4',
              title: 'Processos Judiciais',
              description: 'Processos judiciais relacionados à questão indígena na região.',
              fileName: 'processos_judiciais.pdf',
              originalFileName: 'processos_judiciais.pdf',
              fileSize: 3000000,
              fileType: 'application/pdf',
              filePath: '/documentos/processos_judiciais.pdf',
              category: 'processos',
              property: 'fazenda-brilhante',
              uploadedBy: 'admin',
              isHighlighted: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          setDocuments(staticDocuments as Document[]);
          setLoading(false);
          return;
        }
        
        // Se estiver autenticado, busca os documentos da API
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/documents?property=fazenda-brilhante&isHighlighted=true`,
          { headers }
        );
        
        if (!response.ok) {
          throw new Error('Falha ao carregar documentos destacados');
        }
        
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        console.error('Erro ao buscar documentos destacados:', err);
        setError('Não foi possível carregar os documentos destacados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHighlightedDocuments();
  }, [token]);

  // Verificar se deve mostrar as setas de navegação
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
        
        // Mostrar seta direita se houver conteúdo para scrollar para a direita
        setShowRightArrow(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth);
        
        // Mostrar seta esquerda se já tiver scrollado para a direita
        setShowLeftArrow(scrollLeft > 0);
        
        // Atualizar posição do scroll
        setScrollPosition(scrollLeft);
      }
    };
    
    // Verificar inicialmente
    checkScrollable();
    
    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', checkScrollable);
    
    // Adicionar listener para scroll do container
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', checkScrollable);
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', checkScrollable);
      }
    };
  }, [documents]);

  // Funções para navegação do carrossel
  const scrollLeft = () => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Renderizar mensagem de carregamento
  if (loading) {
    return (
      <div className="document-grid animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="document-card">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-5"></div>
            <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  // Renderizar mensagem se não houver documentos
  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="empty-state-title">Nenhum documento destacado</p>
        <p className="empty-state-text">Não há documentos destacados disponíveis no momento.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Seta de navegação esquerda */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all duration-200 transform -translate-x-1/2"
          aria-label="Rolar para a esquerda"
        >
          <FiChevronLeft className="h-5 w-5 text-[var(--primary)]" />
        </button>
      )}
      
      {/* Container com fade nas bordas */}
      <div className="relative overflow-hidden">
        {/* Gradiente de fade à esquerda */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-[1]"></div>
        )}
        
        {/* Container scrollável */}
        <div 
          ref={containerRef}
          className="flex overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {documents.map((doc) => (
            <div key={doc._id} className="document-card flex-shrink-0 mr-6" style={{ width: '300px' }}>
              <div className="document-tag document-tag-important">Destacado</div>
              <h3>{doc.title}</h3>
              <p>{doc.description || 'Sem descrição'}</p>
              <Link 
                href={doc._id.startsWith('doc') ? doc.filePath : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/documents/${doc._id}/download`} 
                className="btn btn-secondary w-full"
                download
              >
                <FiDownload className="h-5 w-5 mr-2" />
                Download
              </Link>
            </div>
          ))}
        </div>
        
        {/* Gradiente de fade à direita */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-[1]"></div>
        )}
      </div>
      
      {/* Seta de navegação direita */}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all duration-200 transform translate-x-1/2"
          aria-label="Rolar para a direita"
        >
          <FiChevronRight className="h-5 w-5 text-[var(--primary)]" />
        </button>
      )}
    </div>
  );
}
