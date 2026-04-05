'use client'

import { useState, useEffect, type ReactNode } from 'react'

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export interface HeaderProps {
  platformName: string
  platformBadge?: string
  navItems: NavItem[]
  logoHref?: string
  /** User display name (when logged in) */
  userName?: string | null
  /** User initials for avatar circle */
  userInitials?: string | null
  /** Called when user clicks logout */
  onLogout?: () => void
  /** Right-side CTA button */
  ctaLabel?: string
  ctaHref?: string
  /** Extra content for right side */
  rightSlot?: ReactNode
  className?: string
}

export default function Header({
  platformName,
  platformBadge,
  navItems,
  logoHref = '/',
  userName,
  userInitials,
  onLogout,
  ctaLabel,
  ctaHref,
  rightSlot,
  className = '',
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 h-16
          bg-white/80 backdrop-blur-md
          border-b transition-shadow duration-300
          ${scrolled ? 'shadow-warm-md border-surface-200/50' : 'border-transparent'}
          ${className}
        `}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo + Platform Name */}
          <a href={logoHref} className="flex items-center gap-2.5 group flex-shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <span className="font-display font-bold text-primary-800 text-lg">
              {platformName}
            </span>
            {platformBadge && (
              <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium font-body rounded-full bg-primary-100 text-primary-700">
                {platformBadge}
              </span>
            )}
          </a>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group"
              >
                {item.label}
                {/* Animated underline */}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right: User / CTA / Actions */}
          <div className="flex items-center gap-3">
            {rightSlot}

            {/* CTA Button */}
            {ctaLabel && ctaHref && (
              <a
                href={ctaHref}
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold font-body rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200"
              >
                {ctaLabel}
              </a>
            )}

            {/* User avatar + dropdown */}
            {userName && (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
                  aria-label="Benutzermenu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold font-body flex-shrink-0">
                    {userInitials || userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-surface-700 font-body max-w-[120px] truncate">
                    {userName}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400 hidden md:block"><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-warm-lg border border-surface-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-surface-100">
                    <p className="text-sm font-medium text-surface-800 font-body truncate">{userName}</p>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-red-600 transition-colors font-body flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Abmelden
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-700"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-700"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-in panel */}
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white/95 backdrop-blur-md shadow-warm-xl z-40 lg:hidden animate-slide-in-right overflow-y-auto">
            <nav className="p-4 space-y-1" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium font-body text-surface-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                >
                  {item.label}
                </a>
              ))}

              {ctaLabel && ctaHref && (
                <a
                  href={ctaHref}
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 px-4 py-3 text-sm font-semibold font-body text-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                >
                  {ctaLabel}
                </a>
              )}

              {onLogout && (
                <button
                  onClick={() => { onLogout(); setMobileOpen(false) }}
                  className="w-full mt-3 px-4 py-3 text-sm font-medium font-body text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Abmelden
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}
