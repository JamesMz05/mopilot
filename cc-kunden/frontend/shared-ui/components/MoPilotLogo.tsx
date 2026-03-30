'use client'

interface MoPilotLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'color' | 'white' | 'dark'
  animate?: boolean
  className?: string
}

const sizes = {
  sm: { width: 32, height: 32, text: 'text-lg' },
  md: { width: 40, height: 40, text: 'text-xl' },
  lg: { width: 56, height: 56, text: 'text-2xl' },
  xl: { width: 80, height: 80, text: 'text-4xl' },
}

const colors = {
  color: { primary: '#0F766E', accent: '#F59E0B', text: 'text-primary-700' },
  white: { primary: '#FFFFFF', accent: '#FBBF24', text: 'text-white' },
  dark: { primary: '#134E4A', accent: '#F59E0B', text: 'text-surface-900' },
}

export default function MoPilotLogo({
  size = 'md',
  variant = 'color',
  animate = false,
  className = '',
}: MoPilotLogoProps) {
  const { width, height, text } = sizes[size]
  const { primary, accent } = colors[variant]

  return (
    <div
      className={`flex items-center gap-2 ${animate ? 'animate-float' : ''} ${className}`}
      role="img"
      aria-label="MoPilot Logo"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer circle – route/road */}
        <circle cx="24" cy="24" r="22" stroke={primary} strokeWidth="2.5" opacity="0.2" />
        {/* Inner dynamic shape – mobility + AI */}
        <path
          d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24"
          stroke={primary}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* AI node */}
        <circle cx="24" cy="16" r="4" fill={accent} />
        {/* Connection dots */}
        <circle cx="14" cy="32" r="3" fill={primary} />
        <circle cx="36" cy="24" r="3" fill={primary} />
        {/* Small accent dots – data flow */}
        <circle cx="19" cy="22" r="1.5" fill={primary} opacity="0.5" />
        <circle cx="30" cy="18" r="1.5" fill={primary} opacity="0.5" />
      </svg>
      <span className={`font-display font-bold ${text} ${colors[variant].text}`}>
        MoPilot
      </span>
    </div>
  )
}
