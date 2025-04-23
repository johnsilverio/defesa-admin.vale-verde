import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, LinkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

interface ActionButtonsProps {
  id: string;
  viewPath?: string;
  editPath?: string;
  onDelete?: (id: string) => void;
  disableDelete?: boolean;
  disableEdit?: boolean;
  externalLink?: string;
  className?: string;
  hideLabels?: boolean;
}

export default function ActionButtons({
  id,
  viewPath,
  editPath,
  onDelete,
  disableDelete = false,
  disableEdit = false,
  externalLink,
  className,
  hideLabels = true,
}: ActionButtonsProps) {
  return (
    <div className={twMerge('admin-btn-group flex items-center space-x-1', className)}>
      {viewPath && (
        <Link 
          href={viewPath} 
          className="admin-btn admin-btn-secondary rounded p-1 text-xs flex items-center"
          aria-label="Visualizar"
        >
          <EyeIcon className="h-4 w-4" aria-hidden="true" />
          {!hideLabels && <span className="ml-1">Visualizar</span>}
        </Link>
      )}
      
      {externalLink && (
        <Link 
          href={externalLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="admin-btn admin-btn-secondary rounded p-1 text-xs flex items-center"
          aria-label="Link externo"
        >
          <LinkIcon className="h-4 w-4" aria-hidden="true" />
          {!hideLabels && <span className="ml-1">Abrir</span>}
        </Link>
      )}
      
      {editPath && !disableEdit && (
        <Link 
          href={editPath} 
          className="admin-btn admin-btn-primary rounded p-1 text-xs flex items-center"
          aria-label="Editar"
        >
          <PencilIcon className="h-4 w-4" aria-hidden="true" />
          {!hideLabels && <span className="ml-1">Editar</span>}
        </Link>
      )}
      
      {onDelete && !disableDelete && (
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="admin-btn admin-btn-danger rounded p-1 text-xs flex items-center"
          aria-label="Excluir"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
          {!hideLabels && <span className="ml-1">Excluir</span>}
        </button>
      )}
    </div>
  );
} 