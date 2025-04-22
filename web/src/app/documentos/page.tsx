'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ContentPageLayout from '@/components/ContentPageLayout';

interface Document {
  id: number;
  title: string;
  description: string;
  category: string;
  highlighted: boolean;
  url: string;
}

export default function DocumentosPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const documentos: Document[] = [
    {
      id: 1,
      title: 'Defesa Administrativa Completa',
      description: 'Documento completo da defesa administrativa apresentada à FUNAI.',
      category: 'defesa',
      highlighted: false,
      url: '/documentos/defesa_administrativa_fazenda_brilhante.pdf'
    },
    {
      id: 2,
      title: 'Estratégia de Defesa',
      description: 'Documento detalhado com a estratégia completa para a defesa administrativa.',
      category: 'defesa',
      highlighted: false,
      url: '/documentos/estrategia_defesa.pdf'
    },
    {
      id: 3,
      title: 'Análise de Inconsistências',
      description: 'Documento focado nas inconsistências dos estudos antropológicos.',
      category: 'defesa',
      highlighted: false,
      url: '/documentos/analise_inconsistencias.pdf'
    },
    {
      id: 4,
      title: 'Quadro Legal',
      description: 'Análise do quadro legal aplicável ao caso.',
      category: 'defesa',
      highlighted: false,
      url: '/documentos/quadro_legal.pdf'
    },
    {
      id: 5,
      title: 'Memo 549/DEID (Novembro de 2000)',
      description: 'Memorando oficial da FUNAI que afirma explicitamente que "a comunidade Kaiwá do citado Tekohá São Lucas não está ocupando a área da qual teria sido expulsa há várias décadas".',
      category: 'funai',
      highlighted: true,
      url: '/documentos/Memo_549-DEID.pdf'
    },
    {
      id: 6,
      title: 'Memo 580/DEID de 05.12.2000',
      description: 'Memorando oficial da FUNAI que confirma o desconhecimento da existência de comunidade indígena na região em 2000 e menciona a "suposta ocupação" da Aldeia São Lucas.',
      category: 'funai',
      highlighted: true,
      url: '/documentos/Memo_580-DEID_de_05.12.2000.pdf'
    },
    {
      id: 7,
      title: 'Ofício FUNAI',
      description: 'Ofício Nº 349/2025/DPT/FUNAI notificando sobre os estudos demarcatórios.',
      category: 'funai',
      highlighted: false,
      url: '/documentos/oficio_funai.pdf'
    },
    {
      id: 8,
      title: 'Matrícula Originária',
      description: 'Matrícula originária da Fazenda Brilhante, comprovando a cadeia dominial.',
      category: 'propriedade',
      highlighted: false,
      url: '/documentos/matricula_originaria.pdf'
    },
    {
      id: 9,
      title: 'Documento de Lideranças Indígenas (2004)',
      description: 'Documento elaborado por lideranças indígenas em 2004 que lista terras reivindicadas, sem mencionar Santiago-Cuê ou São Lucas.',
      category: 'indigenas',
      highlighted: true,
      url: '/documentos/Liderancas_Indigenas_2004.pdf'
    },
    {
      id: 10,
      title: 'Lei 6.001/73 - Estatuto do Índio',
      description: 'Lei que regulamenta a situação jurídica dos indígenas no Brasil.',
      category: 'legislacao',
      highlighted: false,
      url: '/documentos/estatuto_do_indio.pdf'
    },
    {
      id: 11,
      title: 'Ação Possessória - Processo nº 0001234-56.2023.8.12.0000',
      description: 'Ação possessória relacionada à Fazenda Brilhante.',
      category: 'processos',
      highlighted: false,
      url: '/documentos/acao_possessoria.pdf'
    },
    {
      id: 12,
      title: 'Sentença Judicial - Caso Takuara',
      description: 'Sentença judicial relacionada ao caso de demarcação da Terra Indígena Takuara.',
      category: 'processos',
      highlighted: false,
      url: '/documentos/sentenca_takuara.pdf'
    },
  ];

  const filterCategories = [
    { id: 'all', name: 'Todos' },
    { id: 'defesa', name: 'Defesa Administrativa' },
    { id: 'funai', name: 'Documentos FUNAI' },
    { id: 'processos', name: 'Processos Judiciais' },
    { id: 'propriedade', name: 'Documentos da Propriedade' },
    { id: 'legislacao', name: 'Legislação' },
    { id: 'indigenas', name: 'Documentos Indígenas' },
  ];

  const filteredDocuments = activeFilter === 'all' 
    ? documentos 
    : documentos.filter(doc => doc.category === activeFilter);

  // Group documents by category for display
  const documentsByCategory: { [key: string]: Document[] } = {};
  filteredDocuments.forEach(doc => {
    if (!documentsByCategory[doc.category]) {
      documentsByCategory[doc.category] = [];
    }
    documentsByCategory[doc.category].push(doc);
  });

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
        Object.keys(documentsByCategory).map(category => {
          const categoryName = filterCategories.find(c => c.id === category)?.name || category;
          return (
            <section key={category} className="mb-12">
              <h2 className="section-title text-center">{categoryName}</h2>
              <div className="document-grid">
                {documentsByCategory[category].map((doc: Document) => (
                  <div 
                    key={doc.id} 
                    className={`document-card ${doc.highlighted ? 'border-2 border-[var(--primary-green)]' : ''}`}
                    data-category={doc.category}
                  >
                    <h3>{doc.title}</h3>
                    <p>
                      {doc.highlighted && <span className="font-bold text-[var(--primary-green)] block mb-1">DOCUMENTO CRUCIAL:</span>}
                      {doc.description}
                    </p>
                    <a 
                      href={doc.url} 
                      className={`btn ${doc.highlighted ? '' : 'btn-secondary'} w-full`}
                      download
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      ) : (
        // Display filtered results without category headers
        <div className="document-grid">
          {filteredDocuments.map(doc => (
            <div 
              key={doc.id} 
              className={`document-card ${doc.highlighted ? 'border-2 border-[var(--primary-green)]' : ''}`}
              data-category={doc.category}
            >
              <h3>{doc.title}</h3>
              <p>
                {doc.highlighted && <span className="font-bold text-[var(--primary-green)] block mb-1">DOCUMENTO CRUCIAL:</span>}
                {doc.description}
              </p>
              <a 
                href={doc.url} 
                className={`btn ${doc.highlighted ? '' : 'btn-secondary'} w-full`}
                download
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </ContentPageLayout>
  );
} 