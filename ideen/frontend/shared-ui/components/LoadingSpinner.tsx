'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export default function LoadingSpinner({
  size = 'md',
  label = 'Laden...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <svg
        className={`animate-spin ${sizeClasses[size]}`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          className="text-primary-100"
        />
        <path
          d="M44 24c0-11.046-8.954-20-20-20"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary-600"
        />
      </svg>
      {label && (
        <span className="text-sm text-surface-500 font-body">{label}</span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  )
}
