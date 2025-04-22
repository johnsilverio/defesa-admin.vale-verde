'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock document data
const mockDocuments = [
  { 
    id: 1, 
    title: 'Defesa Administrativa Completa',
    category: 'defesa',
    description: 'Documento completo da defesa administrativa apresentada à FUNAI.',
    fileName: 'defesa_administrativa_fazenda_brilhante.pdf',
    addedAt: new Date(2025, 0, 15),
    size: '2.4 MB'
  },
  { 
    id: 2, 
    title: 'Matrícula Originária',
    category: 'propriedade',
    description: 'Matrícula originária da Fazenda Brilhante, comprovando a cadeia dominial.',
    fileName: 'matricula_originaria.pdf',
    addedAt: new Date(2025, 0, 10),
    size: '1.1 MB'
  },
  { 
    id: 3, 
    title: 'Ofício FUNAI',
    category: 'funai',
    description: 'Ofício da FUNAI notificando sobre os estudos demarcatórios.',
    fileName: 'oficio_funai.pdf',
    addedAt: new Date(2025, 0, 5),
    size: '856 KB'
  },
  { 
    id: 4, 
    title: 'Estratégia de Defesa',
    category: 'defesa',
    description: 'Documento detalhado com a estratégia completa para a defesa administrativa.',
    fileName: 'estrategia_defesa.pdf',
    addedAt: new Date(2024, 11, 20),
    size: '1.8 MB'
  },
  { 
    id: 5, 
    title: 'Análise de Inconsistências',
    category: 'defesa',
    description: 'Documento focado nas inconsistências dos estudos antropológicos.',
    fileName: 'analise_inconsistencias.pdf',
    addedAt: new Date(2024, 11, 15),
    size: '3.2 MB'
  },
];

export default function DocumentsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState(mockDocuments);

  // Filter documents based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle document deletion
  const handleDeleteDocument = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--dark-green)]">Gerenciar Documentos</h1>
          <p className="text-gray-600">Adicione, edite ou remova documentos do site.</p>
        </div>
        <Link 
          href="/admin/documentos/novo" 
          className="btn flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Documento
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              id="category"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              <option value="defesa">Defesa Administrativa</option>
              <option value="funai">Documentos FUNAI</option>
              <option value="propriedade">Documentos da Propriedade</option>
              <option value="processos">Processos Judiciais</option>
              <option value="legislacao">Legislação</option>
              <option value="indigenas">Documentos Indígenas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum documento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">{document.title}</div>
                          <div className="text-xs text-gray-500">{document.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--light-green)] text-[var(--dark-green)]">
                        {document.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.addedAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/documentos/editar/${document.id}`} className="text-[var(--primary-green)] hover:text-[var(--dark-green)]">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 