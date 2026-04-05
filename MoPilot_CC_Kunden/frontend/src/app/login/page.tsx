'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cc-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-cc-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-cc-800">CC Kundenassistent</h1>
          <p className="text-sm text-cc-600 font-medium mt-0.5">powered by MoPilot</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md border border-cc-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cc-500 focus:border-transparent transition"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cc-500 focus:border-transparent transition"
                placeholder="Passwort eingeben"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cc-600 text-white text-sm font-semibold rounded-lg hover:bg-cc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>

          {/* Passwort vergessen Link */}
          <div className="mt-4 text-center">
            <a
              href="https://ideen.mopilot.website/passwort-zuruecksetzen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cc-600 hover:text-cc-800 hover:underline transition-colors"
            >
              Passwort vergessen?
            </a>
          </div>

          {/* Divider */}
          <div className="mt-4 mb-3 border-t border-gray-200"></div>

          {/* Registrierung Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Noch kein Konto?{' '}
              <a
                href="https://ideen.mopilot.website/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cc-600 hover:text-cc-800 font-semibold hover:underline transition-colors"
              >
                Jetzt registrieren
              </a>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Die Registrierung erfolgt zentral auf der MoPilot-Ideenplattform.
          <br />
          Nach der Registrierung können Sie sich hier anmelden.
        </p>
      </div>
    </div>
  )
}
