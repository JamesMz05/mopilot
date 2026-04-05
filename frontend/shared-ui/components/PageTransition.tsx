'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'right' | 'fade'
}

export default function PageTransition({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('visible')
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const directionClass = {
    up: 'reveal',
    right: 'reveal [&:not(.visible)]:translate-x-[-20px] [&:not(.visible)]:translate-y-0',
    fade: 'reveal [&:not(.visible)]:translate-y-0',
  }[direction]

  return (
    <div ref={ref} className={`${directionClass} ${className}`}>
      {children}
    </div>
  )
}
