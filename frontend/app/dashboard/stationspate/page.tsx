'use client'
import { useDashboard } from '../layout'

const quickActions = [
  'Was sind meine Aufgaben?',
  'Wie melde ich einen Schaden?',
  'Wer ist mein Ansprechpartner?',
]

export default function StationspatePage() {
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
    </>
  )
}
