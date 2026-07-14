"use client";

import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string;
}

export default function Select({
  label,
  name,
  options,
  error,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-dark mb-1.5">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`w-full px-4 py-2.5 border rounded-xl text-dark text-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-300'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}