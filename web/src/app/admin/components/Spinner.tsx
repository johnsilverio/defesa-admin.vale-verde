import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'base' | 'lg';
  className?: string;
  variant?: 'primary' | 'white';
}

export default function LoadingSpinner({
  size = 'base',
  className,
  variant = 'primary'
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    base: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-[3px]',
  };

  const variantClasses = {
    primary: 'border-[var(--primary)] border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinnerClasses = twMerge(
    'animate-spin rounded-full',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return <div className={spinnerClasses} />;
} 