'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaFolder } from 'react-icons/fa';

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
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  property: string;
}

interface Property {
  _id: string;
  name: string;
  slug: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    property: '',
    file: null as File | null
  });
  
  const [filters, setFilters] = useState({
    property: '',
    category: '',
    search: ''
  });
  
  const router = useRouter();
  const { token } = useAuth();
  
  // Load data
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [documentsRes, categoriesRes, propertiesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setDocuments(documentsRes.data);
        setCategories(categoriesRes.data);
        setProperties(propertiesRes.data);
        
        if (propertiesRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            property: propertiesRes.data[0]._id
          }));
          
          // Filter categories for the first property
          const propertySlug = propertiesRes.data[0].slug;
          const filteredCats = categoriesRes.data.filter(
            (cat: Category) => cat.property === propertySlug
          );
          setFilteredCategories(filteredCats);
          
          if (filteredCats.length > 0) {
            setFormData(prev => ({
              ...prev,
              category: filteredCats[0]._id
            }));
          }
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  // Update filtered categories when property changes
  useEffect(() => {
    if (formData.property && categories.length > 0 && properties.length > 0) {
      const selectedProperty = properties.find(p => p._id === formData.property);
      if (selectedProperty) {
        const filtered = categories.filter(
          cat => cat.property === selectedProperty.slug
        );
        setFilteredCategories(filtered);
        
        // Reset category if it's no longer valid
        if (filtered.length > 0 && !filtered.some(cat => cat._id === formData.category)) {
          setFormData(prev => ({
            ...prev,
            category: filtered[0]._id
          }));
        } else if (filtered.length === 0) {
          setFormData(prev => ({
            ...prev,
            category: ''
          }));
        }
      }
    }
  }, [formData.property, categories, properties]);
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: filteredCategories.length > 0 ? filteredCategories[0]._id : '',
      property: properties.length > 0 ? properties[0]._id : '',
      file: null
    });
    setSelectedDocument(null);
    setIsEditing(false);
  };
  
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  const openEditForm = (document: Document) => {
    // Find the matching property
    const propertyObj = properties.find(p => p.slug === document.property);
    
    if (!propertyObj) {
      setError('Propriedade do documento não encontrada');
      return;
    }
    
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      description: document.description || '',
      category: document.category._id,
      property: propertyObj._id,
      file: null
    });
    
    setIsEditing(true);
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
  
  const applyFilters = () => {
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (filters.property) queryParams.append('property', filters.property);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setDocuments(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Error filtering documents:', err);
        setError('Erro ao filtrar documentos');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const resetFilters = () => {
    setFilters({
      property: '',
      category: '',
      search: ''
    });
    
    // Load all documents
    if (token) {
      setLoading(true);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setDocuments(res.data);
          setError('');
        })
        .catch(err => {
          console.error('Error fetching documents:', err);
          setError('Erro ao carregar documentos');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    if (!formData.title || !formData.category || !formData.property) {
      setError('Título, categoria e propriedade são obrigatórios');
      return;
    }
    
    if (!isEditing && !formData.file) {
      setError('Arquivo é obrigatório para novos documentos');
      return;
    }
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('property', formData.property);
    if (formData.file) {
      data.append('file', formData.file);
    }
    
    try {
      if (isEditing && selectedDocument) {
        // Update existing document
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${selectedDocument._id}`,
          data,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      } else {
        // Create new document
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/documents`,
          data,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      }
      
      // Refresh documents list
      const { data: documentsData } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocuments(documentsData);
      setShowForm(false);
      resetForm();
      setError('');
    } catch (err: any) {
      console.error('Error saving document:', err);
      setError(err.response?.data?.error || 'Erro ao salvar documento');
    }
  };
  
  const handleDelete = async (documentId: string) => {
    if (!token) return;
    
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Erro ao excluir documento');
    }
  };

  const downloadDocument = (documentId: string) => {
    if (!token) return;
    
    // Create a hidden anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/download`;
    a.setAttribute('download', 'true');
    
    // Add authorization header
    // This won't work directly - actual download should be handled through a fetch and blob
    // But for simplicity, we'll redirect to a signed URL
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const getPropertyName = (slug: string) => {
    const property = properties.find(p => p.slug === slug);
    return property ? property.name : slug;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  if (loading && documents.length === 0) {
  return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Documentos</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Gerenciar Documentos</h1>
          <p className="text-gray-600 mt-1">Adicione, edite e gerencie os documentos disponíveis no site</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/admin/documentos/categorias" 
            className="admin-btn admin-btn-secondary"
          >
            <FaFolder /> Categorias
          </Link>
          <button
            onClick={openCreateForm}
            className="admin-btn admin-btn-primary"
          >
            <FaPlus /> Novo Documento
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-[var(--primary-dark)] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Propriedade
            </label>
            <select
              name="property"
              value={filters.property}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
            >
              <option value="">Todas as propriedades</option>
              {properties.map(property => (
                <option key={property._id} value={property.slug}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Categoria
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name} ({getPropertyName(category.property)})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Busca
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Buscar por título ou descrição"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={resetFilters}
            className="admin-btn admin-btn-outline"
          >
            Limpar
          </button>
          <button
            onClick={applyFilters}
            className="admin-btn admin-btn-primary"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Document Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[var(--primary-dark)]">
                {isEditing ? 'Editar Documento' : 'Novo Documento'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Propriedade
                </label>
                <select
                  name="property"
                  value={formData.property}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Selecione uma propriedade</option>
                  {properties.map(property => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                  disabled={filteredCategories.length === 0}
                >
                  {filteredCategories.length === 0 ? (
                    <option value="">Nenhuma categoria disponível para esta propriedade</option>
                  ) : (
                    <>
                      <option value="">Selecione uma categoria</option>
                      {filteredCategories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                
                {filteredCategories.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Você precisa criar pelo menos uma categoria para esta propriedade primeiro.
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Arquivo {isEditing && '(deixe em branco para manter o arquivo atual)'}
                </label>
                <div className="file-drop-zone" id="dropzone" 
                  onDragOver={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('dropzone');
                    if (el) el.classList.add('dragging');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('dropzone');
                    if (el) el.classList.remove('dragging');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('dropzone');
                    if (el) el.classList.remove('dragging');
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setFormData({
                        ...formData,
                        file: e.dataTransfer.files[0]
                      });
                    }
                  }}
                >
                  <div className="file-input-container">
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className="file-input"
                      required={!isEditing}
                    />
                    <div className="file-input-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {formData.file ? 'Arquivo selecionado' : 'Escolher arquivo ou arrastar aqui'}
                    </div>
                  </div>
                  
                  {formData.file && (
                    <div className="file-info mt-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formData.file.name} ({formatFileSize(formData.file.size)})</span>
                    </div>
                  )}
                  
                  {!formData.file && (
                    <p className="mt-2 text-sm text-gray-500">
                      {isEditing ? 'Arraste um novo arquivo ou clique para selecionar' : 'Arraste um arquivo ou clique para selecionar'}
                    </p>
                  )}
                  
                  {isEditing && selectedDocument && !formData.file && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Arquivo atual: {selectedDocument.originalFileName} ({formatFileSize(selectedDocument.fileSize)})
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="admin-btn admin-btn-outline mr-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={filteredCategories.length === 0}
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">
              Nenhum documento encontrado. {categories.length === 0 ? 'Crie uma categoria antes de adicionar documentos.' : 'Adicione um novo documento para começar.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriedade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map(document => (
                  <tr key={document._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{document.title}</div>
                      {document.description && (
                        <div className="text-sm text-gray-500 mt-1">{document.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {document.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {getPropertyName(document.property)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {document.originalFileName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => downloadDocument(document._id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="Download"
                        >
                          <FaDownload size={16} />
                        </button>
                        <button
                          onClick={() => openEditForm(document)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-full hover:bg-indigo-50"
                          title="Editar"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(document._id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Excluir"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 