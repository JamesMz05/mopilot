'use client'
import { useState, useEffect } from 'react'
import { Menu, X, Zap } from 'lucide-react'

interface UserInfo { name: string; role: string }

const ROLE_LABELS: Record<string, string> = {
  endkunde: 'Endkunde', stationspate: 'Stationspate', hotline: 'Hotline',
  betreiber: 'Betreiber', flottenmanagement: 'Flottenmanagement',
  fahrzeugbetreuer: 'Fahrzeugbetreuer', plattform_support: 'Plattform-Support',
  projekttraeger: 'Projektträger', fahrzeugsteller: 'Fahrzeugsteller',
  validierungsstelle: 'Validierungsstelle',
}

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
  const [loggedUser, setLoggedUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setLoggedUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cc-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cc-600 rounded-lg flex items-center justify-center group-hover:bg-cc-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-cc-800 text-sm sm:text-base">CC Kundenassistent</span>
              <span className="hidden sm:block text-[10px] text-cc-600 font-medium -mt-0.5">
                powered by MoPilot
                {loggedUser && <span className="text-cc-800 font-semibold"> · {loggedUser.name} ({ROLE_LABELS[loggedUser.role] || loggedUser.role})</span>}
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-cc-700 hover:bg-cc-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://cc.evemo.app/admin/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-2 bg-cc-600 text-white text-sm font-semibold rounded-lg hover:bg-cc-700 transition-colors"
            >
              Jetzt registrieren
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-cc-50 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menü öffnen"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-cc-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-cc-700 hover:bg-cc-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://cc.evemo.app/admin/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 px-3 py-2.5 bg-cc-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-cc-700 transition-colors"
          >
            Jetzt registrieren
          </a>
        </div>
      )}
    </header>
  )
}
