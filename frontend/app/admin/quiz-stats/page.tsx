'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ALLOWED_ROLES = [
  'plattform_support', 'plattform-support',
  'projekttraeger', 'fahrzeugsteller', 'validierungsstelle',
  'mopilot_team',
]

interface Overview {
  sessions_total: number
  sessions_completed: number
  completion_rate: number
  avg_score: number
  vouchers_issued: number
  by_device: Record<string, number>
  by_referrer: Record<string, number>
}

interface FunnelQuestion {
  index: number
  reached: number
  answered_correct: number
  answered_wrong: number
}

interface HeatmapAnswer {
  index: number
  text: string
  count: number
}

interface HeatmapQuestion {
  index: number
  question: string
  correct_index: number
  answers: HeatmapAnswer[]
}

export default function QuizStatsPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [funnel, setFunnel] = useState<FunnelQuestion[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapQuestion[]>([])
  const [error, setError] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [])

  const fetchData = useCallback(async () => {
    const headers = getHeaders()
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    const qs = params.toString() ? `?${params.toString()}` : ''

    try {
      const [ovRes, fnRes, hmRes] = await Promise.all([
        fetch(`${API}/api/quiz/stats/overview${qs}`, { headers }),
        fetch(`${API}/api/quiz/stats/funnel${qs}`, { headers }),
        fetch(`${API}/api/quiz/stats/answer-heatmap${qs}`, { headers }),
      ])

      if (ovRes.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }
      if (ovRes.status === 403) {
        setError('Zugriff verweigert. Diese Seite ist nur für Plattform-Support und höher.')
        return
      }

      setOverview(await ovRes.json())
      const fnData = await fnRes.json()
      setFunnel(fnData.questions || [])
      const hmData = await hmRes.json()
      setHeatmap(hmData.questions || [])
    } catch {
      setError('Daten konnten nicht geladen werden.')
    }
  }, [getHeaders, dateFrom, dateTo, router])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { router.push('/login'); return }

    const user = JSON.parse(stored)
    const role = user.role || ''
    const email = user.email || ''

    if (!ALLOWED_ROLES.includes(role) && email !== 'admin@mopilot.website') {
      setError('Zugriff verweigert')
      return
    }

    setAuthorized(true)
    fetchData()
  }, [router, fetchData])

  const handleExportCSV = () => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    const qs = params.toString() ? `?${params.toString()}` : ''
    window.open(`${API}/api/quiz/stats/export.csv${qs}&token=${token}`, '_blank')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-warm-md p-8 max-w-md text-center">
          <p className="text-red-600 font-body">{error}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-primary-600 hover:underline font-body">
            Zurück zur Startseite
          </button>
        </div>
      </div>
    )
  }

  if (!authorized || !overview) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const maxReached = Math.max(...funnel.map(q => q.reached), 1)

  return (
    <div className="min-h-screen bg-surface-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-800">
              Quiz-Statistik
            </h1>
            <p className="text-surface-500 font-body mt-1">Mobilitäts-Check — Auswertung</p>
          </div>
          <button onClick={() => router.push('/')} className="mt-2 md:mt-0 text-primary-600 hover:underline font-body text-sm">
            ← Zurück
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-warm-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-surface-500 font-body mb-1">Von</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-surface-200 rounded-lg px-3 py-2 text-sm font-body" />
          </div>
          <div>
            <label className="block text-xs text-surface-500 font-body mb-1">Bis</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-surface-200 rounded-lg px-3 py-2 text-sm font-body" />
          </div>
          <button onClick={fetchData}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors">
            Filtern
          </button>
          <button onClick={handleExportCSV}
            className="px-4 py-2 border border-surface-300 hover:bg-surface-100 rounded-lg text-sm font-body transition-colors">
            CSV Export ↓
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Aufrufe" value={overview.sessions_total} />
          <KpiCard label="Abschlussquote" value={`${Math.round(overview.completion_rate * 100)}%`} />
          <KpiCard label="Ø Score" value={overview.avg_score} />
          <KpiCard label="Codes ausgegeben" value={overview.vouchers_issued} />
        </div>

        {/* Device + Referrer breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-warm-sm p-5">
            <h3 className="font-display font-semibold text-surface-700 mb-3 text-sm uppercase tracking-wide">Nach Gerät</h3>
            {Object.entries(overview.by_device).map(([device, count]) => (
              <div key={device} className="flex justify-between py-1 text-sm font-body">
                <span className="text-surface-600">{device}</span>
                <span className="font-semibold text-surface-800">{count}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-warm-sm p-5">
            <h3 className="font-display font-semibold text-surface-700 mb-3 text-sm uppercase tracking-wide">Nach Referrer</h3>
            {Object.entries(overview.by_referrer).map(([ref, count]) => (
              <div key={ref} className="flex justify-between py-1 text-sm font-body">
                <span className="text-surface-600 truncate mr-2">{ref}</span>
                <span className="font-semibold text-surface-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white rounded-xl shadow-warm-sm p-5 mb-8">
          <h3 className="font-display font-semibold text-surface-700 mb-4 text-sm uppercase tracking-wide">
            Conversion-Trichter (pro Frage)
          </h3>
          <div className="space-y-2">
            {funnel.map(q => (
              <div key={q.index} className="flex items-center gap-3">
                <span className="text-xs font-body text-surface-500 w-6 text-right">{q.index + 1}</span>
                <div className="flex-1 flex h-6 rounded overflow-hidden bg-surface-100">
                  <div
                    className="bg-primary-400 transition-all duration-500"
                    style={{ width: `${(q.answered_correct / maxReached) * 100}%` }}
                    title={`${q.answered_correct} richtig`}
                  />
                  <div
                    className="bg-red-300 transition-all duration-500"
                    style={{ width: `${(q.answered_wrong / maxReached) * 100}%` }}
                    title={`${q.answered_wrong} falsch`}
                  />
                </div>
                <span className="text-xs font-body text-surface-500 w-10 text-right">{q.reached}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs font-body text-surface-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-400" /> Richtig</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300" /> Falsch</span>
          </div>
        </div>

        {/* Answer Heatmap */}
        <div className="bg-white rounded-xl shadow-warm-sm p-5 mb-8 overflow-x-auto">
          <h3 className="font-display font-semibold text-surface-700 mb-4 text-sm uppercase tracking-wide">
            Antworten-Verteilung
          </h3>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-2 px-2 text-surface-500 font-normal w-8">#</th>
                <th className="text-left py-2 px-2 text-surface-500 font-normal">Frage</th>
                <th className="text-center py-2 px-2 text-surface-500 font-normal w-24">A</th>
                <th className="text-center py-2 px-2 text-surface-500 font-normal w-24">B</th>
                <th className="text-center py-2 px-2 text-surface-500 font-normal w-24">C</th>
                <th className="text-center py-2 px-2 text-surface-500 font-normal w-24">D</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map(q => {
                const maxCount = Math.max(...q.answers.map(a => a.count), 1)
                return (
                  <tr key={q.index} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="py-2 px-2 text-surface-400">{q.index + 1}</td>
                    <td className="py-2 px-2 text-surface-700 max-w-xs truncate" title={q.question}>
                      {q.question}
                    </td>
                    {q.answers.map(a => {
                      const opacity = maxCount > 0 ? Math.max(0.1, a.count / maxCount) : 0.1
                      const isCorrect = a.index === q.correct_index
                      return (
                        <td key={a.index} className="py-2 px-2 text-center relative">
                          <div
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              isCorrect ? 'ring-2 ring-primary-400' : ''
                            }`}
                            style={{ backgroundColor: `rgba(20, 184, 166, ${opacity})`, color: opacity > 0.5 ? 'white' : '#374151' }}
                            title={a.text}
                          >
                            {a.count} {isCorrect && '✓'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-warm-sm p-5 text-center">
      <p className="text-2xl md:text-3xl font-display font-bold text-primary-600">{value}</p>
      <p className="text-sm text-surface-500 font-body mt-1">{label}</p>
    </div>
  )
}
