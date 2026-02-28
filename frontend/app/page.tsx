'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ROLES = [
  { id: 'endkunde', email: 'endkunde@mopilot.website', icon: '👤', label: 'Endkunde', desc: 'Buchung, FAQs, Standorte', color: 'bg-green-50 border-green-300 hover:bg-green-100', zone: 'Kundennah' },
  { id: 'stationspate', email: 'stationspate@mopilot.website', icon: '🏘️', label: 'Stationspate', desc: 'Standortbetreuung, Meldungen', color: 'bg-green-50 border-green-300 hover:bg-green-100', zone: 'Kundennah' },
  { id: 'hotline', email: 'hotline@mopilot.website', icon: '📞', label: 'Hotline', desc: 'Gesprächsleitfaden, Kundenhilfe', color: 'bg-green-50 border-green-300 hover:bg-green-100', zone: 'Kundennah' },
  { id: 'betreiber', email: 'betreiber@mopilot.website', icon: '🏢', label: 'Betreiber', desc: 'Dashboard, Kennzahlen, Strategie', color: 'bg-blue-50 border-blue-300 hover:bg-blue-100', zone: 'Betrieb' },
  { id: 'flotte', email: 'flotte@mopilot.website', icon: '🔧', label: 'Flottenmanagement', desc: 'Fahrzeuge, Wartung, Zuweisung', color: 'bg-blue-50 border-blue-300 hover:bg-blue-100', zone: 'Betrieb' },
  { id: 'fahrzeug', email: 'fahrzeug@mopilot.website', icon: '🔌', label: 'Fahrzeugbetreuer', desc: 'Zustandsprüfung, Laden', color: 'bg-blue-50 border-blue-300 hover:bg-blue-100', zone: 'Betrieb' },
  { id: 'support', email: 'support@mopilot.website', icon: '🖥️', label: 'Plattform-Support', desc: 'Technik, Tickets, Systeme', color: 'bg-blue-50 border-blue-300 hover:bg-blue-100', zone: 'Betrieb' },
  { id: 'traeger', email: 'traeger@mopilot.website', icon: '📊', label: 'Projektträger', desc: 'KPIs, Förderung, Strategie', color: 'bg-orange-50 border-orange-300 hover:bg-orange-100', zone: 'Strategie' },
  { id: 'steller', email: 'steller@mopilot.website', icon: '🚗', label: 'Fahrzeugsteller', desc: 'Fahrzeugintegration, Verträge', color: 'bg-orange-50 border-orange-300 hover:bg-orange-100', zone: 'Strategie' },
  { id: 'validierung', email: 'validierung@mopilot.website', icon: '✅', label: 'Validierungsstelle', desc: 'Führerscheinprüfung, Dokumente', color: 'bg-orange-50 border-orange-300 hover:bg-orange-100', zone: 'Strategie' },
]

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function loginAs(email: string, roleId: string) {
    setLoading(roleId)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'mopilot2026' }),
      })
      if (!res.ok) throw new Error('Login fehlgeschlagen')
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (e: any) {
      setError('Verbindung zum Server fehlgeschlagen. Läuft die API?')
    } finally {
      setLoading(null)
    }
  }

  const zones = ['Kundennah', 'Betrieb', 'Strategie']
  const zoneColors: Record<string, string> = { Kundennah: 'text-green-700', Betrieb: 'text-blue-700', Strategie: 'text-orange-700' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🤖</span>
            <h1 className="text-3xl font-bold tracking-tight">MoPilot</h1>
            <span className="bg-indigo-700/50 text-indigo-200 text-xs px-2 py-1 rounded-full ml-2">PROTOTYP v0.1</span>
          </div>
          <p className="text-indigo-200 text-lg">KI-gestützter Mobilitätsassistent für nachhaltiges Carsharing</p>
          <p className="text-indigo-300 text-sm mt-1">Wählen Sie eine Rolle, um die rollenbasierte Demo zu starten</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto mt-4 px-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        </div>
      )}

      {/* Role cards grouped by zone */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        {zones.map(zone => (
          <div key={zone} className="mb-8">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${zoneColors[zone]}`}>
              {zone === 'Kundennah' && '🟢'} {zone === 'Betrieb' && '🔵'} {zone === 'Strategie' && '🟠'} {zone}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {ROLES.filter(r => r.zone === zone).map(role => (
                <button
                  key={role.id}
                  onClick={() => loginAs(role.email, role.id)}
                  disabled={loading !== null}
                  className={`${role.color} border-2 rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.desc}</div>
                    </div>
                  </div>
                  {loading === role.id && (
                    <div className="mt-2 text-xs text-indigo-600 animate-pulse">Anmeldung läuft...</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Info footer */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-2">ℹ️ Demo-Hinweis</p>
          <p>Alle Accounts verwenden das Passwort <code className="bg-gray-100 px-1 rounded">mopilot2026</code>. Jede Rolle erhält einen eigenen KI-Kontext: Der Assistent passt Tonalität, Wissen und Funktionen an die jeweilige Rolle an.</p>
          <p className="mt-2">Betreiber: <strong>ZEO Carsharing</strong> (Region Bruchsal) · Server: Hetzner CX33 · Domain: mopilot.website</p>
        </div>
      </div>
    </div>
  )
}
