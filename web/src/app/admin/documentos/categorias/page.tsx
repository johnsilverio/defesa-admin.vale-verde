'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  property: string;
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    property: ''
  });
  
  const router = useRouter();
  const { token } = useAuth();
  
  // Fetch categories and properties
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, propertiesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setCategories(categoriesRes.data);
        setProperties(propertiesRes.data);
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
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      property: category.property
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
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new category
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Refresh categories list
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories(data);
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
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setCategories(categories.filter(cat => cat._id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Erro ao excluir categoria');
    }
  };
  
  const getPropertyName = (slug: string) => {
    const property = properties.find(p => p.slug === slug);
    return property ? property.name : slug;
  };
  
  if (loading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
        <button
          onClick={openCreateForm}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Nova Categoria
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            
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
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="mr-2 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {categories.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Nenhuma categoria encontrada. Crie uma nova categoria para começar.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriedade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPropertyName(category.property)}
                  </td>
                  <td className="px-6 py-4">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openEditForm(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 