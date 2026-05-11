'use client'

import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white overflow-hidden shadow-sm ${
        hoverable ? 'cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1' : ''
      } ${className}`}
      style={{ borderColor: 'var(--color-neutral-200)' }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b ${className}`}
      style={{ borderColor: 'var(--color-neutral-200)' }}
    >
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t ${className}`}
      style={{ borderColor: 'var(--color-neutral-200)' }}
    >
      {children}
    </div>
  )
}
