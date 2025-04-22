'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  properties?: string[];
}

type ModalType = 'create' | 'edit' | null;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    properties: ['fazenda-brilhante']
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
    // Log para depuração
    console.log('Contexto de autenticação:', user);
  }, [user, router]);
  
  // Reset form when modal type changes
  useEffect(() => {
    if (modalType === 'create') {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        properties: ['fazenda-brilhante']
      });
      setSelectedUser(null);
    } else if (modalType === 'edit' && selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        password: '',
        role: selectedUser.role,
        properties: selectedUser.properties || ['fazenda-brilhante']
      });
    }
  }, [modalType, selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      
      // Garantir que os usuários tenham IDs válidos
      const validUsers = data.users.map((user: any) => ({
        ...user,
        id: user.id || user._id // Usar _id como fallback se id não estiver definido
      }));
      
      setUsers(validUsers);
      console.log('Usuários carregados:', validUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se for admin, envie sem propriedades
    const userData = {
      ...formData,
      properties: formData.role === 'admin' ? [] : formData.properties
    };
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (modalType === 'create') {
        // Criar novo usuário
        const response = await fetch(`/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar usuário');
        }
        
        toast.success('Usuário criado com sucesso');
      } else if (modalType === 'edit' && selectedUser) {
        // Editar usuário existente
        // Se a senha estiver vazia, remova-a do objeto para não atualizar
        const updateData: Partial<typeof userData> = { ...userData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        const response = await fetch(`/api/auth/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar usuário');
        }
        
        toast.success('Usuário atualizado com sucesso');
      }
      
      setModalType(null);
      setFormData({ name: '', email: '', password: '', role: 'user', properties: ['fazenda-brilhante'] });
      fetchUsers();
    } catch (error) {
      console.error('Erro na operação:', error);
      toast.error(error instanceof Error ? error.message : 'Erro na operação');
    }
  };
  
  const handleEdit = (user: User) => {
    // Verificar se o usuário está tentando editar seu próprio perfil
    if (user.email === localStorage.getItem('user_email')) {
      // Redirecionar para a página de configurações
      router.push('/admin/configuracoes');
      return;
    }
    
    // Se não for o próprio usuário, abrir o modal de edição normalmente
    setSelectedUser(user);
    setModalType('edit');
  };
  
  const handleDelete = async (userId: string | undefined) => {
    try {
      // Verificar se o ID é válido antes de prosseguir
      if (!userId) {
        toast.error('ID de usuário inválido');
        setDeleteConfirmation(null);
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }
      
      toast.success('Usuário excluído com sucesso');
      setDeleteConfirmation(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">Adicione, edite e gerencie os usuários do sistema</p>
        </div>
        <button
          onClick={() => setModalType('create')}
          className="bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-4 py-2 rounded-md flex items-center transition-all shadow-md hover:shadow-lg"
        >
          <FaUserPlus className="mr-2" /> Novo Usuário
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriedades</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="text-gray-500 text-xs">Acesso administrativo completo</span>
                    ) : (
                      <div>
                        {user.properties && user.properties.length > 0 ? (
                          user.properties.map((prop, index) => (
                            <span key={index} className="px-2 mr-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {prop}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">Nenhuma propriedade</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deleteConfirmation === user.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                          title="Confirmar"
                          data-user-id={user.id} // Adicionar atributo de dados para depuração
                        >
                          <FaCheck size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(null)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Cancelar"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-full hover:bg-indigo-50"
                          title={user.email === localStorage.getItem('user_email') ? "Editar (Configurações)" : "Editar"}
                        >
                          <FaEdit size={16} />
                        </button>
                        {user.email !== window.localStorage.getItem('user_email') && (
                          <button 
                            onClick={() => setDeleteConfirmation(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Excluir"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[var(--primary-dark)]">
                {modalType === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Senha {modalType === 'edit' && '(deixe em branco para manter a senha atual)'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required={modalType === 'create'}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                  Função
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              {formData.role === 'user' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Propriedades
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="fazenda-brilhante"
                      checked={formData.properties.includes('fazenda-brilhante')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            properties: [...formData.properties, 'fazenda-brilhante']
                          });
                        } else {
                          setFormData({
                            ...formData,
                            properties: formData.properties.filter(p => p !== 'fazenda-brilhante')
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="fazenda-brilhante">Fazenda Brilhante</label>
                  </div>
                  {formData.properties.length === 0 && (
                    <p className="text-red-500 text-xs">Selecione pelo menos uma propriedade</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
                  disabled={formData.role === 'user' && formData.properties.length === 0}
                >
                  {modalType === 'create' ? 'Criar' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 