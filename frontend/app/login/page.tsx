'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Feature items for the left panel
const features = [
  { icon: '🤖', text: 'KI-gestützte Mobilität', delay: 0 },
  { icon: '🌱', text: 'Nachhaltig & elektrisch', delay: 150 },
  { icon: '🏘️', text: 'Für den ländlichen Raum', delay: 300 },
]

export default function LoginPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = loginId.includes('@')
      ? { email: loginId, password }
      : { username: loginId, password }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token)
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Ungültige E-Mail oder Passwort.')
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel – visual branding */}
      <div className="relative lg:w-[60%] bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex flex-col justify-center items-center px-8 py-12 lg:py-0 overflow-hidden">
        {/* Topography background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                <path d="M0 200 Q100 180 200 200 Q300 220 400 200" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0 160 Q80 130 180 155 Q280 180 400 150" fill="none" stroke="white" strokeWidth="0.8" />
                <path d="M0 240 Q120 260 220 240 Q320 220 400 250" fill="none" stroke="white" strokeWidth="0.8" />
                <path d="M0 120 Q60 100 160 115 Q260 130 400 110" fill="none" stroke="white" strokeWidth="0.6" />
                <path d="M0 280 Q140 300 240 280 Q340 260 400 290" fill="none" stroke="white" strokeWidth="0.6" />
                <path d="M0 80 Q100 60 200 75 Q300 90 400 70" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M0 320 Q80 340 200 325 Q320 310 400 330" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="1.5" fill="white" opacity="0.5" />
                <circle cx="300" cy="150" r="1.5" fill="white" opacity="0.5" />
                <circle cx="200" cy="300" r="1.5" fill="white" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          {/* Animated Logo */}
          <div className={`flex items-center gap-3 mb-8 justify-center lg:justify-start transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
              <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2.5" opacity="0.3" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#FBBF24" />
              <circle cx="14" cy="32" r="3" fill="white" />
              <circle cx="36" cy="24" r="3" fill="white" />
              <circle cx="19" cy="22" r="1.5" fill="white" opacity="0.5" />
              <circle cx="30" cy="18" r="1.5" fill="white" opacity="0.5" />
            </svg>
            <span className="text-3xl font-display font-bold text-white">MoPilot</span>
          </div>

          {/* Tagline */}
          <h1 className={`text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-6 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Die Zukunft der Mobilität{' '}
            <span className="bg-gradient-to-r from-white to-accent-300 bg-clip-text text-transparent">
              beginnt hier.
            </span>
          </h1>

          {/* Feature points */}
          <div className="space-y-4 mt-8">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 justify-center lg:justify-start transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${400 + f.delay}ms` }}
              >
                <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                <span className="text-white/90 font-body text-lg">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Foerderer bar at bottom */}
        <div className={`absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-white/30 text-xs font-body">Gefördert durch</span>
          <span className="text-white/30 text-xs font-body">BMDV</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30 text-xs font-body">NOW GmbH</span>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="lg:w-[40%] flex items-center justify-center px-6 py-12 lg:py-0 bg-surface-50">
        <div className="w-full max-w-sm">
          {/* Small logo for right side */}
          <div className="flex items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <span className="font-display font-bold text-lg text-primary-700">MoPilot</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-surface-900 mb-1">
            Willkommen zurück
          </h2>
          <p className="text-surface-500 font-body text-sm mb-8">
            Melde dich an, um fortzufahren
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-surface-700 mb-1.5 font-body">
                E-Mail oder Benutzername
              </label>
              <input
                id="loginId"
                type="text"
                autoComplete="username"
                required
                autoFocus
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-sm font-body bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
                placeholder="ihre@email.de oder Benutzername"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5 font-body">
                Passwort
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-surface-200 rounded-xl text-sm font-body bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="Passwort eingeben"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-body" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold font-body rounded-xl hover:from-primary-700 hover:to-primary-800 hover:scale-[1.02] hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-warm-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Anmelden...
                </span>
              ) : 'Anmelden'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-surface-400 font-body">oder</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          <p className="text-center text-sm text-surface-500 font-body">
            Noch kein Konto?{' '}
            <a href="https://ideen.mopilot.website/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors">
              Auf der Ideenplattform registrieren →
            </a>
          </p>

          <p className="text-center text-xs text-surface-400 font-body mt-8">
            &copy; 2025 MoPilot – Ein Projekt der Vianova eG
          </p>
        </div>
      </div>
    </div>
  )
}
