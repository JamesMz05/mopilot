'use client'
import { useDashboard } from '../layout'

const quickActions = [
  'Fahrzeugstatus aller Stationen',
  'Wartung fällig – welche Fahrzeuge?',
  'Neues Fahrzeug einpflegen',
]

export default function FlottenmanagementPage() {
  const { setInput } = useDashboard()

  return (
    <>
      <p className="text-xs font-semibold font-body text-surface-500 uppercase tracking-wider mb-3">Schnellaktionen</p>
      <div className="space-y-2">
        {quickActions.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="w-full text-left text-sm font-body bg-surface-50 hover:bg-primary-50 hover:text-primary-700 border border-surface-200 rounded-xl px-3 py-2 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Flottenmanagement</p>
      <a
        href="/stationen"
        className="w-full flex items-center gap-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg px-3 py-2.5 transition-colors font-medium"
      >
        📍 Stationen & Fahrzeuge live
      </a>
    </>
  )
}
