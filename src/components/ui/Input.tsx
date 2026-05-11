'use client'

import React, { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
}

export function Input({ label, error, icon, helperText, className = '', ...rest }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          className={`input w-full ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...rest}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.101 8.101a1 1 0 001.414 0l8.101-8.101z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {helperText}
        </p>
      )}
    </div>
  )
}
