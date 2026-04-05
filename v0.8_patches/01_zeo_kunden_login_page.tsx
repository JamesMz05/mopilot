// =============================================================================
// PATCH 01: ZEO-Kunden Login-Seite – Neue Version
// Ziel-Datei: /opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/login/page.tsx
// (sowie /opt/zeo-kunden/frontend/src/app/login/page.tsx nach rsync)
//
// Änderungen v0.8:
// - "Passwort vergessen?" Link hinzugefügt → leitet zu ideen.mopilot.website/passwort-zuruecksetzen
// - "Noch kein Konto? Jetzt registrieren" Link hinzugefügt → leitet zu ideen.mopilot.website/register
// - Layout-Verbesserungen
// =============================================================================

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.detail || data.message || 'Ungültige Anmeldedaten')
      }
    } catch (err) {
      setError('Server nicht erreichbar. Bitte versuchen Sie es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-800">
            ZEO Kundenassistent
          </h1>
          <p className="text-surface-600 font-body mt-2">
            powered by MoPilot
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-warm-lg p-8 border border-surface-200/50">
          <h2 className="text-xl font-display font-semibold text-surface-800 mb-6">
            Anmelden
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body text-surface-800 placeholder:text-surface-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ihr Passwort"
                required
                className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-body text-surface-800 placeholder:text-surface-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-warm-md hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          {/* Passwort vergessen Link */}
          <div className="mt-4 text-center">
            <a
              href="https://ideen.mopilot.website/passwort-zuruecksetzen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors font-body"
            >
              Passwort vergessen?
            </a>
          </div>

          {/* Divider */}
          <div className="mt-6 mb-4 border-t border-surface-200"></div>

          {/* Registrierung Link */}
          <div className="text-center">
            <p className="text-sm text-surface-600 font-body">
              Noch kein Konto?{' '}
              <a
                href="https://ideen.mopilot.website/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 font-semibold hover:underline transition-colors"
              >
                Jetzt registrieren
              </a>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-surface-500 mt-6 font-body">
          Die Registrierung erfolgt zentral auf der MoPilot-Ideenplattform.
          <br />
          Nach der Registrierung können Sie sich hier anmelden.
        </p>
      </div>
    </div>
  )
}
