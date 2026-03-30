'use client'

import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { label: 'Assistent', href: '#chat' },
  { label: 'Tarife', href: '#tarife' },
  { label: 'Kostenrechner', href: '#kosten' },
  { label: 'Stationen', href: '#stationen' },
  { label: 'Reichweite', href: '#reichweite' },
  { label: 'Fahrzeuge', href: '#fahrzeuge' },
  { label: "So geht's", href: '#onboarding' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b transition-shadow duration-300 ${
          scrolled ? 'shadow-warm-md border-surface-200/50' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#22c55e" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <div>
              <span className="font-display font-bold text-primary-800 text-lg">CC</span>
              <span className="hidden sm:inline text-xs text-surface-500 font-body ml-1.5">Kundenassistent</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Hauptnavigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://cc.evemo.app/admin/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold font-body rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200"
            >
              Jetzt registrieren
            </a>

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

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white/95 backdrop-blur-md shadow-warm-xl z-40 lg:hidden animate-slide-in-right overflow-y-auto">
            <nav className="p-4 space-y-1" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium font-body text-surface-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors">
                  {item.label}
                </a>
              ))}
              <a href="https://cc.evemo.app/admin/signup" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="block mt-3 px-4 py-3 text-sm font-semibold font-body text-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                Jetzt registrieren
              </a>
            </nav>
          </div>
        </>
      )}

      <div className="h-16" />
    </>
  )
}
