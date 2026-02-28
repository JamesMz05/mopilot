'use client'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Assistent', href: '#chat' },
  { label: 'Kostenrechner', href: '#kosten' },
  { label: 'Stationen', href: '#stationen' },
  { label: 'Reichweite', href: '#reichweite' },
  { label: 'Fahrzeuge', href: '#fahrzeuge' },
  { label: 'So geht\'s', href: '#onboarding' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zeo-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-zeo-600 rounded-lg flex items-center justify-center group-hover:bg-zeo-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-zeo-800 text-sm sm:text-base">ZEO Kundenassistent</span>
              <span className="hidden sm:block text-[10px] text-zeo-600 font-medium -mt-0.5">powered by MoPilot</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-zeo-700 hover:bg-zeo-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://www.zeo-carsharing.de"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-2 bg-zeo-600 text-white text-sm font-semibold rounded-lg hover:bg-zeo-700 transition-colors"
            >
              Jetzt registrieren
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-zeo-50 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menü öffnen"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-zeo-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-zeo-700 hover:bg-zeo-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://www.zeo-carsharing.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 px-3 py-2.5 bg-zeo-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-zeo-700 transition-colors"
          >
            Jetzt registrieren
          </a>
        </div>
      )}
    </header>
  )
}
