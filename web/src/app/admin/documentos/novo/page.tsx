'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewDocument() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    isHighlighted: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Somente arquivos PDF ou Word são permitidos.');
        setFile(null);
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('O arquivo deve ter no máximo 10MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setFileError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Por favor, selecione um arquivo.');
      return;
    }
    
    if (!formData.title || !formData.category) {
      return; // Form validation is handled by HTML required attribute
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would upload the file to your server/storage
      // For this demonstration, we'll just simulate a successful upload
      console.log('Form Data:', formData);
      console.log('File:', file);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to documents page after successful upload
      router.push('/admin/documentos');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Ocorreu um erro ao enviar o documento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link 
          href="/admin/documentos" 
          className="mr-4 text-gray-600 hover:text-[var(--dark-green)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--dark-green)]">Adicionar Documento</h1>
          <p className="text-gray-600">Faça upload de um novo documento para o site.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Documento *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                placeholder="Ex: Defesa Administrativa Completa"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="defesa">Defesa Administrativa</option>
                <option value="funai">Documentos FUNAI</option>
                <option value="propriedade">Documentos da Propriedade</option>
                <option value="processos">Processos Judiciais</option>
                <option value="legislacao">Legislação</option>
                <option value="indigenas">Documentos Indígenas</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                placeholder="Breve descrição do documento..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[var(--primary-green)] hover:text-[var(--dark-green)] focus-within:outline-none"
                    >
                      <span>Faça upload de um arquivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF ou Word até 10MB</p>
                  {file && (
                    <p className="text-sm text-[var(--primary-green)]">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                  {fileError && (
                    <p className="text-sm text-red-500">
                      {fileError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isHighlighted"
                  name="isHighlighted"
                  type="checkbox"
                  checked={formData.isHighlighted}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-[var(--primary-green)] focus:ring-[var(--primary-green)] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isHighlighted" className="font-medium text-gray-700">
                  Destacar documento
                </label>
                <p className="text-gray-500">
                  Documentos destacados aparecem com destaque especial no site.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/documentos"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn"
            >
              {isSubmitting ? 'Enviando...' : 'Salvar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 