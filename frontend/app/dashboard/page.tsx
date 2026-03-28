'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ROLE_META: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  endkunde: { icon: '👤', label: 'Endkunde', color: 'text-green-700', bgColor: 'bg-green-50' },
  stationspate: { icon: '🏘️', label: 'Stationspate', color: 'text-green-700', bgColor: 'bg-green-50' },
  hotline: { icon: '📞', label: 'Hotline', color: 'text-green-700', bgColor: 'bg-green-50' },
  betreiber: { icon: '🏢', label: 'Betreiber', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  flottenmanagement: { icon: '🔧', label: 'Flottenmanagement', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  fahrzeugbetreuer: { icon: '🔌', label: 'Fahrzeugbetreuer', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  plattform_support: { icon: '🖥️', label: 'Plattform-Support', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  projekttraeger: { icon: '📊', label: 'Projektträger', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  fahrzeugsteller: { icon: '🚗', label: 'Fahrzeugsteller', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  validierungsstelle: { icon: '✅', label: 'Validierungsstelle', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  mopilot_team: { icon: '🛡️', label: 'MoPilot-Team', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
}

interface Message { role: 'user' | 'assistant'; content: string }
interface UserInfo { name: string; role: string; operator: string; email: string }

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'info'>('chat')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { router.push('/'); return }
    setUser(JSON.parse(stored))
  }, [router])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, session_id: sessionId }),
      })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Verbindung zum Server fehlgeschlagen.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null
  const meta = ROLE_META[user.role] || ROLE_META.endkunde

  // Quick action suggestions per role
  const suggestions: Record<string, string[]> = {
    endkunde: ['Wie buche ich ein Fahrzeug?', 'Was kostet eine Fahrt?', 'Wo ist der nächste Standort?', 'Wie lade ich das E-Auto?'],
    stationspate: ['Was sind meine Aufgaben?', 'Wie melde ich einen Schaden?', 'Wer ist mein Ansprechpartner?'],
    hotline: ['Kunde kann Fahrzeug nicht öffnen', 'Preisauskunft für Neukunden', 'Fahrzeug hat Schaden – was tun?'],
    betreiber: ['Aktuelle Nutzungszahlen', 'Tarifvergleich Eco vs. Eco-plus', 'Neue Standorte planen'],
    flottenmanagement: ['Fahrzeugstatus aller Stationen', 'Wartung fällig – welche Fahrzeuge?', 'Neues Fahrzeug einpflegen'],
    fahrzeugbetreuer: ['Checkliste Fahrzeugprüfung', 'Ladezustand melden', 'Schadensbericht erstellen'],
    plattform_support: ['Systemstatus prüfen', 'Bekannte Störungen', 'Ticket erstellen'],
    projekttraeger: ['KPI-Übersicht Q1', 'CO₂-Einsparung berechnen', 'Vergleich ZEO vs. CC'],
    fahrzeugsteller: ['Technische Anforderungen', 'Hardware-Integration', 'Vertragskonditionen'],
    validierungsstelle: ['Offene Validierungen', 'Dokumentenanforderungen', 'Prozess Führerscheinprüfung'],
  }
  const quickActions = suggestions[user.role] || suggestions.endkunde

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Glassmorphism Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-surface-200/50 shadow-warm-sm px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 group">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <span className="font-display font-bold text-primary-800 text-lg">MoPilot</span>
          </a>
          <span className="text-surface-400 text-sm hidden sm:inline font-body">KI-Assistent</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="hidden sm:inline-flex relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group">
            Hauptmenü
            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </a>
          <div className={`${meta.bgColor} px-3 py-1 rounded-full flex items-center gap-2`}>
            <span className="text-sm">{meta.icon}</span>
            <span className={`text-xs font-semibold font-body ${meta.color}`}>{meta.label}</span>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors" aria-label="Benutzermenu">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold font-body">
                {initials}
              </div>
              <span className="hidden md:inline text-sm font-medium text-surface-700 font-body max-w-[120px] truncate">{user.name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400 hidden md:block"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-warm-lg border border-surface-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 py-2 border-b border-surface-100">
                <p className="text-sm font-medium text-surface-800 font-body">{user.name}</p>
                <p className="text-xs text-surface-500 font-body">{meta.label} · {user.operator.toUpperCase()}</p>
              </div>
              <a href="/" className="block px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 transition-colors font-body">Hauptmenü</a>
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-red-600 transition-colors font-body flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-surface-200 flex-col hidden lg:flex">
          <div className="p-4 border-b border-surface-100">
            <div className="flex gap-1">
              <button onClick={() => setSidebarTab('chat')} className={`flex-1 text-xs font-semibold font-body py-2 rounded-lg ${sidebarTab === 'chat' ? 'bg-primary-100 text-primary-700' : 'text-surface-400 hover:text-surface-600'}`}>💬 Chat</button>
              <button onClick={() => setSidebarTab('info')} className={`flex-1 text-xs font-semibold font-body py-2 rounded-lg ${sidebarTab === 'info' ? 'bg-primary-100 text-primary-700' : 'text-surface-400 hover:text-surface-600'}`}>ℹ️ Info</button>
            </div>
          </div>

          {sidebarTab === 'chat' ? (
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold font-body text-surface-500 uppercase tracking-wider mb-3">Schnellaktionen</p>
              <div className="space-y-2">
                {quickActions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="w-full text-left text-sm font-body bg-surface-50 hover:bg-primary-50 hover:text-primary-700 border border-surface-200 rounded-xl px-3 py-2 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setMessages([]); setSessionId(null) }}
                className="w-full mt-4 text-sm font-body text-surface-400 hover:text-red-500 border border-dashed border-surface-200 rounded-xl px-3 py-2"
              >
                🗑 Neuer Chat
              </button>

              {/* Flottenmanagement */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Flottenmanagement</p>
              <a
                href="/stationen"
                className="w-full flex items-center gap-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg px-3 py-2.5 transition-colors font-medium"
              >
                📍 Stationen & Fahrzeuge live
              </a>
            </div>
          ) : (
            <div className="p-4 flex-1 overflow-y-auto text-sm font-body text-surface-600 space-y-3">
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="font-semibold text-surface-700">Rolle: {meta.label}</p>
                <p className="text-xs text-surface-500 mt-1">Der KI-Assistent passt seine Antworten, Tonalität und verfügbaren Informationen an Ihre Rolle an.</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="font-semibold text-surface-700">Betreiber: {user.operator.toUpperCase()}</p>
                <p className="text-xs text-surface-500 mt-1">{user.operator === 'zeo' ? 'ZEO Carsharing, Region Bruchsal' : 'Car&RideSharing Community eG'}</p>
              </div>
              <div className="bg-primary-50 rounded-xl p-3">
                <p className="font-semibold text-primary-700">🤖 Prototyp v0.73</p>
                <p className="text-xs text-primary-600 mt-1">MoPilot Demo mit rollenbasiertem KI-Chat. Daten sind Beispieldaten.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2.5" opacity="0.3" />
                    <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="24" cy="16" r="4" fill="#F59E0B" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-bold text-surface-800 mt-4">Willkommen bei MoPilot, {user.name}!</h2>
                <p className="text-surface-500 font-body mt-2">Ich bin Ihr KI-Assistent als <strong className="text-primary-700">{meta.label}</strong>.</p>
                <p className="text-surface-400 text-sm font-body mt-1">Stellen Sie mir eine Frage oder nutzen Sie die Schnellaktionen links.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl mx-auto lg:hidden">
                  {quickActions.slice(0, 3).map((q, i) => (
                    <button key={i} onClick={() => setInput(q)} className="text-sm font-body bg-white border border-surface-200 hover:border-primary-300 rounded-full px-4 py-2 text-surface-600 hover:text-primary-700 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 mb-4 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* AI avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-warm-sm" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-body ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm shadow-warm-sm'
                  : 'bg-white border border-surface-200 text-surface-800 rounded-bl-sm shadow-warm-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold font-body shadow-warm-sm" aria-hidden="true">
                    {initials}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2.5 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-warm-sm" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-warm-sm">
                  <div className="flex gap-1.5" aria-label="KI tippt...">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-surface-200 bg-white px-4 py-3">
            <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Frage an MoPilot als ${meta.label} stellen...`}
                className="flex-1 border border-surface-300 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-surface-300 disabled:to-surface-300 text-white px-6 py-3 rounded-xl text-sm font-semibold font-body transition-all duration-200 hover:shadow-warm-md"
              >
                Senden
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
