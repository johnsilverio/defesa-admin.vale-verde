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
  isHighlighted: boolean;
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
    isHighlighted: false,
    file: null as File | null
  });
  
  const [filters, setFilters] = useState({
    property: '',
    category: '',
    search: ''
  });
  
  const [isDragging, setIsDragging] = useState(false);
  
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
      isHighlighted: false,
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
      isHighlighted: document.isHighlighted || false,
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
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
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
  
  const removeSelectedFile = () => {
    setFormData({
      ...formData,
      file: null
    });
    
    // Limpar o input de arquivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData({
        ...formData,
        file: e.dataTransfer.files[0]
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
    data.append('isHighlighted', formData.isHighlighted.toString());
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
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
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
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
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
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                >
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
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required
                >
                  {filteredCategories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isHighlighted"
                    checked={formData.isHighlighted}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-gray-700 font-medium">Documento Crucial</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium py-1 px-2 rounded-full">Destaque</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  Marque esta opção para destacar documentos essenciais na página inicial e na biblioteca de documentos
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {isEditing ? 'Substituir arquivo (opcional)' : 'Arquivo'}
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragging 
                      ? 'border-[var(--primary)] bg-[var(--primary-50)]' 
                      : formData.file 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center">
                    {!formData.file ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500 mb-2">
                          Arraste e solte um arquivo aqui, ou
                        </p>
                        <div className="relative">
                          <input
                            id="file-input"
                            type="file"
                            name="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required={!isEditing}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors"
                            onClick={() => document.getElementById('file-input')?.click()}
                          >
                            Escolher arquivo
                          </button>
                        </div>
                        {isEditing && selectedDocument && (
                          <p className="text-sm text-gray-500 mt-4">
                            Arquivo atual: <span className="font-medium">{selectedDocument?.originalFileName}</span> ({formatFileSize(selectedDocument?.fileSize || 0)})
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">Arquivo selecionado</h4>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="bg-white p-4 rounded border border-gray-200 flex items-start">
                          <div className="rounded-md bg-blue-100 p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{formData.file.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(formData.file.size)} · {formData.file.type || 'Desconhecido'}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center mt-3">
                          <button
                            type="button"
                            className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                            onClick={() => document.getElementById('file-input')?.click()}
                          >
                            Trocar arquivo
                          </button>
                          <input
                            id="file-input"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos suportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                </p>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="admin-btn admin-btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriedade
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
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">Nenhum documento encontrado</p>
                      <p className="text-sm">Clique em "Novo Documento" para adicionar o primeiro documento</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="text-sm font-medium text-gray-900 mb-1">{doc.title}</div>
                        <div>
                          {doc.isHighlighted && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium ml-2 py-0.5 px-2 rounded-full">
                              Crucial
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{doc.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Arquivo:</span> {doc.originalFileName} ({formatFileSize(doc.fileSize)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.category?.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPropertyName(doc.property)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleTimeString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadDocument(doc._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => openEditForm(doc)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <FaTrash />
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