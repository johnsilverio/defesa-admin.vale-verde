'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSave, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function ConfiguracoesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
      return;
    }

    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setSaving(true);
      
      // Preparar dados para atualização (excluir senha se vazia)
      const updateData: any = {
        name: formData.name,
      };
      
      // Incluir senha apenas se foi fornecida
      if (formData.password) {
        updateData.password = formData.password;
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/auth/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      const data = await response.json();
      toast.success('Perfil atualizado com sucesso');
      
      // Limpar campos de senha após atualização bem-sucedida
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Configurações da Conta</h1>
          <p className="text-gray-600 mt-1">Atualize suas informações pessoais e senha</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="name">
                <FaUser className="mr-2 text-[var(--primary)]" /> Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                required
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="email">
                <FaEnvelope className="mr-2 text-[var(--primary)]" /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="password">
                <FaLock className="mr-2 text-[var(--primary)]" /> Nova Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Deixe em branco para manter a senha atual"
              />
            </div>

            <div className="mb-8">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center" htmlFor="confirmPassword">
                <FaLock className="mr-2 text-[var(--primary)]" /> Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
