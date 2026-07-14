"use client";

import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name: string;
  error?: string;
}

export default function Textarea({
  label,
  name,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-dark mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={5}
        className={`w-full px-4 py-2.5 border rounded-xl text-dark text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-vertical ${
          error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}