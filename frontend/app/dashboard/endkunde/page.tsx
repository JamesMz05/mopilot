'use client'
import { useDashboard } from '../layout'

const quickActions = [
  'Wie buche ich ein Fahrzeug?',
  'Was kostet eine Fahrt?',
  'Wo ist der nächste Standort?',
  'Wie lade ich das E-Auto?',
]

export default function EndkundePage() {
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

      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mt-6 mb-2">Kundenportale</p>
      <div className="space-y-2">
        <a
          href="https://zeo-kunden.mopilot.website/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2.5 transition-colors font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          ZEO Kundenportal
        </a>
        <a
          href="https://cc-kunden.mopilot.website/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2.5 transition-colors font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          CC Kundenportal
        </a>
      </div>
    </>
  )
}
