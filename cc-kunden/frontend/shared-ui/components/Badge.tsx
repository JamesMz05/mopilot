'use client'

import { type ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'ai' | 'beta' | 'new'
  size?: 'sm' | 'md'
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantClasses = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  accent: 'bg-accent-100 text-accent-700 border-accent-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  neutral: 'bg-surface-100 text-surface-600 border-surface-200',
  ai: 'bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 border-primary-200',
  beta: 'bg-violet-100 text-violet-700 border-violet-200',
  new: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Badge({
  variant = 'primary',
  size = 'sm',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-body font-medium
        rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
