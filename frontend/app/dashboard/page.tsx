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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <span className="font-bold text-lg">MoPilot</span>
          <span className="text-indigo-300 text-sm hidden sm:inline">KI-Assistent</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`${meta.bgColor} px-3 py-1 rounded-full flex items-center gap-2`}>
            <span>{meta.icon}</span>
            <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
          </div>
          <span className="text-indigo-300 text-sm hidden md:inline">{user.name}</span>
          <span className="text-indigo-400 text-xs hidden lg:inline">({user.operator.toUpperCase()})</span>
          <button onClick={logout} className="text-indigo-300 hover:text-white text-sm underline">Abmelden</button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex">
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-1">
              <button onClick={() => setSidebarTab('chat')} className={`flex-1 text-xs font-semibold py-2 rounded-lg ${sidebarTab === 'chat' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}>💬 Chat</button>
              <button onClick={() => setSidebarTab('info')} className={`flex-1 text-xs font-semibold py-2 rounded-lg ${sidebarTab === 'info' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}>ℹ️ Info</button>
            </div>
          </div>

          {sidebarTab === 'chat' ? (
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Schnellaktionen</p>
              <div className="space-y-2">
                {quickActions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="w-full text-left text-sm bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setMessages([]); setSessionId(null) }}
                className="w-full mt-4 text-sm text-gray-400 hover:text-red-500 border border-dashed border-gray-200 rounded-lg px-3 py-2"
              >
                🗑 Neuer Chat
              </button>
            </div>
          ) : (
            <div className="p-4 flex-1 overflow-y-auto text-sm text-gray-600 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-700">Rolle: {meta.label}</p>
                <p className="text-xs text-gray-500 mt-1">Der KI-Assistent passt seine Antworten, Tonalität und verfügbaren Informationen an Ihre Rolle an.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-700">Betreiber: {user.operator.toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-1">{user.operator === 'zeo' ? 'ZEO Carsharing, Region Bruchsal' : 'Car&RideSharing Community eG'}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="font-semibold text-indigo-700">🤖 Prototyp v0.1</p>
                <p className="text-xs text-indigo-500 mt-1">MoPilot Demo mit rollenbasiertem KI-Chat. Daten sind Beispieldaten.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 chat-scroll">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <span className="text-6xl">🤖</span>
                <h2 className="text-xl font-bold text-gray-700 mt-4">Willkommen bei MoPilot, {user.name}!</h2>
                <p className="text-gray-500 mt-2">Ich bin Ihr KI-Assistent als <strong>{meta.label}</strong>.</p>
                <p className="text-gray-400 text-sm mt-1">Stellen Sie mir eine Frage oder nutzen Sie die Schnellaktionen links.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl mx-auto lg:hidden">
                  {quickActions.slice(0, 3).map((q, i) => (
                    <button key={i} onClick={() => setInput(q)} className="text-sm bg-white border border-gray-200 hover:border-indigo-300 rounded-full px-4 py-2 text-gray-600 hover:text-indigo-700 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                }`}>
                  {msg.role === 'assistant' && <span className="text-xs text-indigo-500 font-semibold">🤖 MoPilot</span>}
                  <p className="text-sm whitespace-pre-wrap mt-1">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <span className="text-xs text-indigo-500 font-semibold">🤖 MoPilot</span>
                  <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Frage an MoPilot als ${meta.label} stellen...`}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
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
