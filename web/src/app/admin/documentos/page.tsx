'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaFolder, FaFileUpload, FaTags, FaSearch, FaCalendarAlt, FaFileDownload, FaChevronLeft, FaChevronRight, FaUndo, FaFileAlt } from 'react-icons/fa';

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
  property: {
    _id: string;
    name: string;
    slug: string;
  } | string; // Pode ser string (slug) ou objeto completo dependendo do contexto
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
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
    search: '',
    sortBy: 'date_desc'
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
    // Determinar o valor da propriedade para encontrar o objeto correspondente
    const propertySlug = typeof document.property === 'string' 
      ? document.property 
      : document.property.slug;
    
    // Encontrar a propriedade usando o slug
    const propertyObj = properties.find(p => p.slug === propertySlug);
    
    if (!propertyObj) {
      setError(`Propriedade do documento não encontrada (slug: ${propertySlug})`);
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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    // Para inputs do tipo checkbox, usar o valor de "checked"
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Para outros tipos de inputs, usar o value
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
    const fileInput = window.document.getElementById('file-input') as HTMLInputElement;
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
      search: '',
      sortBy: 'date_desc'
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
    
    if (deleteConfirmId) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${deleteConfirmId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Remove from local state
        setDocuments(documents.filter(doc => doc._id !== deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Erro ao excluir documento');
        setDeleteConfirmId(null);
      }
    } else {
      setDeleteConfirmId(documentId);
    }
  };

  const confirmDelete = (documentId: string) => {
    setDeleteConfirmId(documentId);
  };

  const downloadDocument = async (documentId: string) => {
    if (!token) return;
    
    try {
      // Obter a URL assinada do documento
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.url) {
        // Obter o nome original do arquivo
        const documentItem = documents.find(doc => doc._id === documentId);
        const fileName = documentItem?.originalFileName || 'documento';
        
        // Baixar o arquivo usando fetch
        const fileResponse = await fetch(response.data.url);
        const blob = await fileResponse.blob();
        
        // Criar URL do blob e iniciar download
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        
        window.document.body.appendChild(a);
        a.click();
        
        // Limpar
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      setError('Não foi possível baixar o documento. Por favor, tente novamente.');
    }
  };
  
  const getPropertyName = (property: string | { _id: string; name: string; slug: string }) => {
    if (typeof property === 'object' && property !== null) {
      return property.name;
    }
    
    // Caso receba apenas o slug da propriedade
    const propertyObj = properties.find(p => p.slug === property);
    return propertyObj ? propertyObj.name : property;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  if (loading && documents.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary-dark)]">Gerenciar Documentos</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Adicione, edite e gerencie os documentos do sistema</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button 
              onClick={openCreateForm}
              className="admin-btn admin-btn-primary w-full sm:w-auto flex items-center justify-center min-h-[44px]"
            >
              <FaFileUpload className="inline-block flex-shrink-0 mr-2" /> 
              <span>Novo Documento</span>
            </button>
            <button 
              className="admin-btn admin-btn-secondary w-full sm:w-auto flex items-center justify-center min-h-[44px]"
              onClick={() => router.push('/admin/documentos/categorias')}
            >
              <FaTags className="inline-block flex-shrink-0 mr-2" /> 
              <span>Gerenciar Categorias</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6 border border-gray-200 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--primary-dark)] mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoryFilter"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por título
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchFilter"
                  className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Digite para buscar..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                id="sortOrder"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
              >
                <option value="date_desc">Data (mais recente)</option>
                <option value="date_asc">Data (mais antigo)</option>
                <option value="title_asc">Título (A-Z)</option>
                <option value="title_desc">Título (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end mt-4">
            <button 
              className="admin-btn admin-btn-outline py-2 px-4 flex items-center justify-center min-h-[44px]" 
              onClick={resetFilters}
            >
              <FaUndo className="inline-block flex-shrink-0 mr-2" /> 
              <span>Limpar filtros</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary-dark)]">Gerenciar Documentos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Adicione, edite e gerencie os documentos do sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button 
            onClick={openCreateForm}
            className="admin-btn admin-btn-primary w-full sm:w-auto flex items-center justify-center min-h-[44px]"
          >
            <FaFileUpload className="inline-block flex-shrink-0 mr-2" /> 
            <span>Novo Documento</span>
          </button>
          <button 
            className="admin-btn admin-btn-secondary w-full sm:w-auto flex items-center justify-center min-h-[44px]"
            onClick={() => router.push('/admin/documentos/categorias')}
          >
            <FaTags className="inline-block flex-shrink-0 mr-2" /> 
            <span>Gerenciar Categorias</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6 border border-gray-200 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--primary-dark)] mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="categoryFilter"
              className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por título
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchFilter"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite para buscar..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              id="sortOrder"
              className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
            >
              <option value="date_desc">Data (mais recente)</option>
              <option value="date_asc">Data (mais antigo)</option>
              <option value="title_asc">Título (A-Z)</option>
              <option value="title_desc">Título (Z-A)</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-4">
          <button 
            className="admin-btn admin-btn-outline py-2 px-4 flex items-center justify-center min-h-[44px]" 
            onClick={resetFilters}
          >
            <FaUndo className="inline-block flex-shrink-0 mr-2" /> 
            <span>Limpar filtros</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map(doc => (
            <div 
              key={doc._id} 
              className="bg-white shadow-sm rounded-lg p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-grow mb-4 md:mb-0 md:mr-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <FaFileAlt className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--primary-dark)] mb-1">{doc.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {doc.category && (
                          <span 
                            key={doc.category._id} 
                            className="inline-block bg-[var(--primary-50)] text-[var(--primary-dark)] text-xs px-2 py-1 rounded-full"
                          >
                            {doc.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="mx-2">•</span>
                        <FaFileDownload className="mr-1" />
                        <span>{doc.downloads || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 md:flex-col md:space-x-0 md:space-y-2">
                  <button
                    onClick={() => openEditForm(doc)}
                    className="admin-btn admin-btn-secondary flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2"
                    title="Editar documento"
                  >
                    <FaEdit size={18} className="inline-block" /> 
                    <span className="hidden sm:inline ml-2">Editar</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(doc._id)}
                    className="admin-btn admin-btn-danger flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2"
                    title="Excluir documento"
                  >
                    <FaTrash size={18} className="inline-block" /> 
                    <span className="hidden sm:inline ml-2">Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="admin-btn admin-btn-outline py-2 px-4 flex items-center justify-center min-w-[44px] min-h-[44px] disabled:opacity-50"
            >
              <FaChevronLeft className="inline-block" />
            </button>
            <span className="py-2 px-4 bg-white border border-gray-300 rounded-md flex items-center justify-center min-h-[44px]">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="admin-btn admin-btn-outline py-2 px-4 flex items-center justify-center min-w-[44px] min-h-[44px] disabled:opacity-50"
            >
              <FaChevronRight className="inline-block" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 text-center">
          <FaFileAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento encontrado</h3>
          <p className="text-gray-500 mb-4">Não foram encontrados documentos com os filtros selecionados.</p>
          <button
            onClick={openCreateForm}
            className="admin-btn admin-btn-primary flex items-center justify-center min-h-[44px]"
          >
            <FaFileUpload className="inline-block flex-shrink-0 mr-2" /> 
            <span>Adicionar um documento</span>
          </button>
        </div>
      )}
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 sm:p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="mb-5 sm:mb-6 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[var(--primary-dark)]">Confirmar exclusão</h2>
            </div>
            <p className="mb-5 sm:mb-6 text-gray-700">
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="admin-btn admin-btn-outline w-full sm:w-auto flex items-center justify-center min-h-[44px]"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="admin-btn admin-btn-danger w-full sm:w-auto flex items-center justify-center min-h-[44px]"
              >
                <FaTrash className="inline-block flex-shrink-0 mr-2" /> 
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Novo/Editar Documento */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl my-4 sm:my-8">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--primary-dark)]">
                {isEditing ? 'Editar Documento' : 'Novo Documento'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="property" className="block text-gray-700 text-sm font-bold mb-2">
                    Propriedade
                  </label>
                  <select
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {properties.map(property => (
                      <option key={property._id} value={property._id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Categoria
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {filteredCategories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isHighlighted"
                    name="isHighlighted"
                    checked={formData.isHighlighted}
                    onChange={handleInputChange}
                    className="h-5 w-5 mr-3"
                  />
                  <div>
                    <label htmlFor="isHighlighted" className="text-gray-700 font-medium">
                      Destacar documento
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Marque esta opção para destacar documentos importantes na biblioteca
                    </p>
                  </div>
                </div>
                
                <div>
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
                              onClick={() => window.document.getElementById('file-input')?.click()}
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
                              onClick={() => window.document.getElementById('file-input')?.click()}
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
              </div>
              
              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end mt-6 pt-4 border-t border-gray-200 gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="admin-btn admin-btn-outline w-full sm:w-auto flex items-center justify-center min-h-[44px]"
                >
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary w-full sm:w-auto flex items-center justify-center min-h-[44px]"
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}