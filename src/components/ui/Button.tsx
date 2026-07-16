"use client";

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary-dark hover:to-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 focus:ring-primary/50',
  secondary: 'bg-gradient-to-r from-secondary to-secondary-light text-white hover:from-emerald-700 hover:to-secondary shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 focus:ring-secondary/50',
  outline: 'border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary focus:ring-primary/50',
  ghost: 'text-primary hover:bg-primary/10 focus:ring-primary/50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 focus:ring-red-500/50',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 cursor-pointer ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}