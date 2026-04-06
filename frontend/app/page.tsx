'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DokuSection from "@/components/DokuSection";

interface UserInfo { name: string; role: string; email?: string }

const ROLES = [
  { id: 'endkunde', icon: '👤', label: 'Endkunde', desc: 'Buchung, FAQs, Standorte', zone: 'Kundennah' },
  { id: 'stationspate', icon: '🏘️', label: 'Stationspate', desc: 'Standortbetreuung, Meldungen', zone: 'Kundennah' },
  { id: 'hotline', icon: '📞', label: 'Hotline', desc: 'Gesprächsleitfaden, Kundenhilfe', zone: 'Kundennah' },
  { id: 'betreiber', icon: '🏢', label: 'Betreiber', desc: 'Dashboard, Kennzahlen, Strategie', zone: 'Betrieb' },
  { id: 'flotte', icon: '🔧', label: 'Flottenmanagement', desc: 'Fahrzeuge, Wartung, Zuweisung', zone: 'Betrieb' },
  { id: 'fahrzeug', icon: '🔌', label: 'Fahrzeugbetreuer', desc: 'Zustandsprüfung, Laden', zone: 'Betrieb' },
  { id: 'support', icon: '🖥️', label: 'Plattform-Support', desc: 'Technik, Tickets, Systeme', zone: 'Betrieb' },
  { id: 'traeger', icon: '📊', label: 'Projektträger', desc: 'KPIs, Förderung, Strategie', zone: 'Strategie' },
  { id: 'steller', icon: '🚗', label: 'Fahrzeugsteller', desc: 'Fahrzeugintegration, Verträge', zone: 'Strategie' },
  { id: 'validierung', icon: '✅', label: 'Validierungsstelle', desc: 'Führerscheinprüfung, Dokumente', zone: 'Strategie' },
]

const ZONE_STYLES: Record<string, { dot: string; card: string; text: string }> = {
  Kundennah: { dot: 'bg-emerald-500', card: 'bg-emerald-50/80 border-emerald-200', text: 'text-emerald-700' },
  Betrieb: { dot: 'bg-blue-500', card: 'bg-blue-50/80 border-blue-200', text: 'text-blue-700' },
  Strategie: { dot: 'bg-amber-500', card: 'bg-amber-50/80 border-amber-200', text: 'text-amber-700' },
}

const ROLE_LABELS: Record<string, string> = {
  endkunde: 'Endkunde', stationspate: 'Stationspate', hotline: 'Hotline',
  betreiber: 'Betreiber', flottenmanagement: 'Flottenmanagement',
  fahrzeugbetreuer: 'Fahrzeugbetreuer', plattform_support: 'Plattform-Support',
  projekttraeger: 'Projektträger', fahrzeugsteller: 'Fahrzeugsteller',
  validierungsstelle: 'Validierungsstelle',
  mopilot_team: 'MoPilot-Team',
}

export default function HomePage() {
  const [loggedUser, setLoggedUser] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setLoggedUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setLoggedUser(null)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.refresh()
  }

  const zones = ['Kundennah', 'Betrieb', 'Strategie']

  return (
    <div id="main-content" className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200/50 shadow-warm-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <span className="font-display font-bold text-primary-800 text-lg">MoPilot</span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            <a href="/dashboard" className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group">
              Dashboard
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </a>
            <a href="https://ideen.mopilot.website" target="_blank" rel="noopener noreferrer" className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group">
              Ideen
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loggedUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors" aria-label="Benutzermenu">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold font-body">
                    {loggedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-surface-700 font-body">{loggedUser.name}</span>
                  {loggedUser.role && <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-medium font-body rounded-full bg-primary-100 text-primary-700">{ROLE_LABELS[loggedUser.role] || loggedUser.role}</span>}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-warm-lg border border-surface-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-surface-100">
                    <p className="text-sm font-medium text-surface-800 font-body">{loggedUser.name}</p>
                    <p className="text-xs text-surface-500 font-body">{ROLE_LABELS[loggedUser.role] || loggedUser.role}</p>
                  </div>
                  <a href="/dashboard" className="block px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 transition-colors font-body">Zum Dashboard</a>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-red-600 transition-colors font-body flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Abmelden
                  </button>
                </div>
              </div>
            ) : (
              <a href="/login" className="px-4 py-2 text-sm font-semibold font-body rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200">
                Anmelden
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="topo-hero" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse"><path d="M0 200 Q100 180 200 200 Q300 220 400 200" fill="none" stroke="white" strokeWidth="1" /><path d="M0 160 Q80 130 180 155 Q280 180 400 150" fill="none" stroke="white" strokeWidth="0.8" /><path d="M0 240 Q120 260 220 240 Q320 220 400 250" fill="none" stroke="white" strokeWidth="0.8" /></pattern></defs><rect width="100%" height="100%" fill="url(#topo-hero)" /></svg>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">KI-gestützter Mobilitätsassistent</h1>
          <p className="text-white/80 font-body text-lg">Rollenbasiertes Cockpit für nachhaltiges E-Carsharing</p>
          {loggedUser && <p className="text-white/60 font-body text-sm mt-2">Angemeldet als {loggedUser.name} ({ROLE_LABELS[loggedUser.role] || loggedUser.role})</p>}
          {!loggedUser && (
            <a href="/login" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold font-body text-sm transition-all duration-200 border border-white/20">
              Jetzt anmelden
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </a>
          )}
        </div>
      </div>

      {/* Role info cards (not clickable) */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <p className="text-sm text-surface-500 font-body mb-6">MoPilot passt Inhalte, Tonalität und Funktionen an die jeweilige Nutzerrolle an:</p>
        {zones.map(zone => {
          const style = ZONE_STYLES[zone]
          return (
            <div key={zone} className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <h2 className={`text-sm font-bold font-body uppercase tracking-wider ${style.text}`}>{zone}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ROLES.filter(r => r.zone === zone).map(role => (
                  <div key={role.id} className={`${style.card} border rounded-xl p-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl shadow-warm-sm flex-shrink-0">
                        {role.icon}
                      </div>
                      <div>
                        <div className="font-semibold font-body text-surface-800">{role.label}</div>
                        <div className="text-xs font-body text-surface-500">{role.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Projekt Doku */}
        <DokuSection />

        {/* Info footer */}
        <div className="mt-8 bg-white border border-surface-200 rounded-xl p-6 text-sm font-body text-surface-500 shadow-warm-sm">
          <p className="font-semibold text-surface-700 mb-2">Zugang</p>
          <p>Account- und Rollenverwaltung über <a href="https://ideen.mopilot.website/admin" className="text-primary-600 hover:text-primary-800 underline">ideen.mopilot.website/admin</a>. Registrierung über <a href="https://ideen.mopilot.website/register" className="text-primary-600 hover:text-primary-800 underline">ideen.mopilot.website/register</a>.</p>
          <p className="mt-2">
            <a href="https://status.mopilot.website/status/mopilot" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 underline">System-Monitoring (Status-Seite)</a>
          </p>
        </div>
      </div>
    </div>
  )
}
