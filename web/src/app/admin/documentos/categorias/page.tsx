'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaArrowsAlt } from 'react-icons/fa';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  property: string;
  order: number;
  createdAt: string;
}

interface Property {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    property: ''
  });
  
  const router = useRouter();
  const { token, isAdmin } = useAuth();
  
  // Fetch categories and properties
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, propertiesRes] = await Promise.all([
          apiRequest<Category[]>('/api/categories'),
          apiRequest<Property[]>('/api/properties')
        ]);
        
        setCategories(categoriesRes);
        setProperties(propertiesRes);
        
        if (propertiesRes.length > 0) {
          const firstProperty = propertiesRes[0].slug;
          setSelectedProperty(firstProperty);
          
          // Filter categories for the first property
          const filteredCats = categoriesRes.filter(
            (cat: Category) => cat.property === firstProperty
          );
          setFilteredCategories(filteredCats);
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
  
  // Update filtered categories when selected property changes
  useEffect(() => {
    if (selectedProperty && categories.length > 0) {
      const filtered = categories.filter(cat => cat.property === selectedProperty);
      setFilteredCategories(filtered);
    }
  }, [selectedProperty, categories]);
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      property: properties.length > 0 ? properties[0]._id : ''
    });
    setSelectedCategory(null);
    setIsEditing(false);
  };
  
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  const openEditForm = (category: Category) => {
    // Find the matching property ID from slug
    const propertyObj = properties.find(p => p.slug === category.property);
    if (!propertyObj) {
      setError('Propriedade da categoria não encontrada');
      return;
    }
    
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      property: propertyObj._id
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
  
  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProperty(e.target.value);
    setOrderChanged(false);
  };
  
  const handleDragStart = (position: number) => {
    dragItem.current = position;
  };
  
  const handleDragEnter = (position: number) => {
    dragOverItem.current = position;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // Copy the array to avoid direct state mutation
    const newCategories = [...filteredCategories];
    
    // Get the dragged item
    const draggedItem = newCategories[dragItem.current];
    
    // Remove the dragged item from the array
    newCategories.splice(dragItem.current, 1);
    
    // Insert the dragged item at the new position
    newCategories.splice(dragOverItem.current, 0, draggedItem);
    
    // Update the order property for each category
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));
    
    // Update the state
    setFilteredCategories(updatedCategories);
    setOrderChanged(true);
    
    // Reset the refs
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const saveOrder = async () => {
    if (!token) return;
    
    setSavingOrder(true);
    try {
      // Prepare the categories with their new order
      const categoriesToUpdate = filteredCategories.map(cat => ({
        _id: cat._id,
        order: cat.order
      }));
      
      // Send the update request
      await apiRequest('/api/categories-order', {
        method: 'PUT',
        data: { categories: categoriesToUpdate }
      });
      
      // Update the main categories array with the new order
      const updatedCategories = categories.map(cat => {
        const updatedCat = filteredCategories.find(fc => fc._id === cat._id);
        return updatedCat || cat;
      });
      
      setCategories(updatedCategories);
      setOrderChanged(false);
      setError('');
    } catch (err) {
      console.error('Error saving category order:', err);
      setError('Erro ao salvar ordem das categorias');
    } finally {
      setSavingOrder(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    if (!formData.name || !formData.property) {
      setError('Nome e propriedade são obrigatórios');
      return;
    }
    
    try {
      if (isEditing && selectedCategory) {
        // Update existing category
        await apiRequest(`/api/categories/${selectedCategory._id}`, {
          method: 'PUT',
          data: formData
        });
      } else {
        // Create new category
        await apiRequest('/api/categories', {
          method: 'POST',
          data: formData
        });
      }
      
      // Refresh categories list
      const categoriesData = await apiRequest<Category[]>('/api/categories');
      
      setCategories(categoriesData);
      setShowForm(false);
      resetForm();
      setError('');
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.error || 'Erro ao salvar categoria');
    }
  };
  
  const handleDelete = async (categoryId: string) => {
    if (!token) return;
    
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os documentos associados serão excluídos.')) {
      return;
    }
    
    try {
      await apiRequest(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      // Remove from local state
      setCategories(categories.filter(cat => cat._id !== categoryId));
      
      // Update filtered categories
      setFilteredCategories(filteredCategories.filter(cat => cat._id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Erro ao excluir categoria');
    }
  };
  
  const getPropertyName = (slug: string) => {
    const property = properties.find(p => p.slug === slug);
    return property ? property.name : slug;
  };
  
  if (loading && categories.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Categorias</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <Link href="/admin/documentos" className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar para Documentos
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Gerenciar Categorias</h1>
          <p className="text-gray-600 mt-1">Adicione, edite, exclua e reordene as categorias de documentos</p>
        </div>
        <button
          onClick={openCreateForm}
          className="admin-btn admin-btn-primary"
        >
          <FaPlus /> Nova Categoria
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Filtrar por Propriedade
          </label>
          <select
            value={selectedProperty}
            onChange={handlePropertyChange}
            className="w-full md:w-1/3 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            {properties.map((property) => (
              <option key={property._id} value={property.slug}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="border-b pb-2 mb-2 flex font-medium text-gray-700">
            <div className="w-10"></div>
            <div className="w-1/3">Nome</div>
            <div className="w-1/3">Descrição</div>
            <div className="w-1/4 text-right">Ações</div>
          </div>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Nenhuma categoria encontrada para esta propriedade. Clique em "Nova Categoria" para adicionar uma.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category, index) => (
                <div 
                  key={category._id}
                  className="flex items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-grab"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="w-10 flex justify-center text-gray-400">
                    <FaArrowsAlt className="cursor-grab" title="Arraste para reordenar" />
                  </div>
                  <div className="w-1/3 font-medium">{category.name}</div>
                  <div className="w-1/3 text-gray-600 truncate">{category.description || '—'}</div>
                  <div className="w-1/4 flex justify-end space-x-3">
                    <button
                      onClick={() => openEditForm(category)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {orderChanged && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className="admin-btn admin-btn-primary"
              >
                {savingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Salvar Ordem
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[var(--primary-dark)]">
                {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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
                ></textarea>
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
    </div>
  );
} 