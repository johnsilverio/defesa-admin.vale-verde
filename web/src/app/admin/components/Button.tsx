import Link from 'next/link'
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import LoadingSpinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children?: ReactNode
}

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'base',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = twMerge(
    'admin-btn rounded-md font-medium relative inline-flex items-center justify-center',
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    fullWidth ? 'w-full' : '',
  )

  const variantClasses = {
    primary: 'admin-btn-primary bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'admin-btn-secondary bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
    danger: 'admin-btn-danger bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    outline: 'admin-btn-outline border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'admin-btn-ghost text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
  }

  const sizeClasses = {
    xs: 'text-xs py-1 px-2 gap-1',
    sm: 'text-sm py-1.5 px-2.5 gap-1.5',
    base: 'text-sm py-2 px-3 gap-2',
    lg: 'text-base py-2.5 px-4 gap-2',
  }

  const classes = twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isLoading ? 'cursor-not-allowed' : '',
    className,
  )

  const renderContent = () => (
    <>
      {isLoading && (
        <LoadingSpinner 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
          size={size === 'xs' || size === 'sm' ? 'sm' : 'base'} 
        />
      )}
      <span className={`inline-flex items-center justify-center ${isLoading ? 'invisible' : ''}`}>
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        {children && <span className={icon ? (iconPosition === 'left' ? 'ml-1' : 'mr-1') : ''}>{children}</span>}
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </span>
    </>
  )

  return (
    <button type={type} className={classes} disabled={isLoading} {...props}>
      {renderContent()}
    </button>
  )
}

interface LinkButtonProps {
  href: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
  children?: ReactNode
  newTab?: boolean
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'base',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  newTab,
  ...props
}: LinkButtonProps) {
  const baseClasses = twMerge(
    'admin-btn rounded-md font-medium inline-flex items-center justify-center',
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    fullWidth ? 'w-full' : '',
  )

  const variantClasses = {
    primary: 'admin-btn-primary bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'admin-btn-secondary bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
    danger: 'admin-btn-danger bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    outline: 'admin-btn-outline border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'admin-btn-ghost text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
  }

  const sizeClasses = {
    xs: 'text-xs py-1 px-2 gap-1',
    sm: 'text-sm py-1.5 px-2.5 gap-1.5',
    base: 'text-sm py-2 px-3 gap-2',
    lg: 'text-base py-2.5 px-4 gap-2',
  }

  const classes = twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  return (
    <Link
      href={href}
      className={classes}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children && <span className={icon ? (iconPosition === 'left' ? 'ml-1' : 'mr-1') : ''}>{children}</span>}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </Link>
  )
} 