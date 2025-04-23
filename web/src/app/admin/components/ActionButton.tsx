import React from 'react';
import clsx from 'clsx';

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
  tooltip?: string;
  fullWidth?: boolean;
}

export default function ActionButton({
  label,
  icon,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  iconOnly = false,
  tooltip,
  fullWidth = false,
}: ActionButtonProps) {
  const sizeClasses = {
    xs: 'text-xs py-1 px-2',
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-2.5 px-5',
  };

  const variantClasses = {
    primary: 'admin-btn-primary',
    secondary: 'admin-btn-secondary',
    danger: 'admin-btn-danger',
    success: 'admin-btn-success',
    warning: 'admin-btn-warning',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={clsx(
        'admin-btn rounded-md font-medium transition-colors flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        iconOnly ? 'aspect-square !p-0 flex items-center justify-center' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      {icon && (
        <span className={clsx('flex-shrink-0', iconOnly ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4 mr-2')}>
          {icon}
        </span>
      )}
      {!iconOnly && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
} 