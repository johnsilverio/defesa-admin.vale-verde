import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Determina quais páginas mostrar
  let pagesToShow = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      // Início
      pagesToShow = [...pages.slice(0, 5), totalPages];
    } else if (currentPage >= totalPages - 2) {
      // Final
      pagesToShow = [1, ...pages.slice(totalPages - 5)];
    } else {
      // Meio
      pagesToShow = [
        1,
        ...pages.slice(currentPage - 2, currentPage + 1),
        totalPages,
      ];
    }
  }

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-4">
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="admin-btn admin-btn-secondary px-2 py-1 rounded text-xs flex items-center disabled:opacity-50"
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>
      </div>
      
      <div className="hidden md:flex">
        {pagesToShow.map((page, i) => {
          // Adiciona reticências quando há lacunas
          if (i > 0 && page - pagesToShow[i - 1] > 1) {
            return (
              <span key={`gap-${i}`} className="mx-2 inline-flex items-center">
                ...
              </span>
            );
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`mx-1 inline-flex h-8 w-8 items-center justify-center rounded-md ${
                currentPage === page
                  ? 'admin-btn-primary'
                  : 'admin-btn-ghost text-gray-500'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      <div className="md:hidden flex items-center justify-center px-2">
        <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="admin-btn admin-btn-secondary px-2 py-1 rounded text-xs flex items-center disabled:opacity-50"
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRightIcon className="h-4 w-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
} 