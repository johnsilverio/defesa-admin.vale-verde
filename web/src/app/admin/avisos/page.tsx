"use client";
import { FaPlus } from "react-icons/fa";
export default function AvisosPage() {
  const openCreateForm = () => {
  };
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Gerenciar Avisos</h1>
          <p className="text-gray-600 mt-1">Adicione, edite e gerencie os avisos e notícias do site</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={openCreateForm}
            className="admin-btn admin-btn-primary"
          >
            <FaPlus /> Novo Aviso
          </button>
        </div>
      </div>
    </div>
  );
}