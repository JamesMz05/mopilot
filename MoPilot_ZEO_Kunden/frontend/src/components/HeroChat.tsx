'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Leaf } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const SUGGESTED = [
  'Was kostet eine Fahrt nach Karlsruhe?',
  'Welches Auto ist für 6 Personen geeignet?',
  'Wie melde ich mich bei ZEO an?',
  'Wie weit komme ich im Winter?',
  'Was ist der Unterschied zwischen eco und eco plus?',
  'Wie öffne ich das Fahrzeug?',
]

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export default function HeroChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hallo! 👋 Ich bin Ihr ZEO Kundenassistent. Ich beantworte gerne Fragen zu Tarifen, Fahrzeugen, Buchung, Reichweite und allem rund um ZEO E-Carsharing in der Region Bruchsal. Wie kann ich Ihnen helfen?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null) 
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const history = messages
      .filter(m => !m.streaming)
      .map(m => ({ role: m.role, content: m.content }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', streaming: true },
    ])

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            accumulated += parsed.text || ''
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: accumulated,
                streaming: true,
              }
              return updated
            })
          } catch {}
        }
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: accumulated || 'Entschuldigung, es ist ein Fehler aufgetreten.',
          streaming: false,
        }
        return updated
      })
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Es tut mir leid, ich bin gerade nicht erreichbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie die ZEO Hotline: **0 61 31 83 832 333**.',
          streaming: false,
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <section id="chat" className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-zeo-100 text-zeo-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            KI-gestützter Assistent
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zeo-900 mb-3">
            Ihr ZEO Kundenassistent
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Stellen Sie Ihre Fragen zu Tarifen, Fahrzeugen, Buchung und mehr – auf Basis der offiziellen ZEO-Inhalte.
          </p>
        </div>

        {/* Chat container */}
        <div className="bg-white rounded-2xl shadow-lg border border-zeo-100 overflow-hidden">
          {/* Messages */}
         <div ref={scrollContainerRef} className="h-[420px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-zeo-50/30 to-white">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 msg-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white ${
                    msg.role === 'assistant' ? 'bg-zeo-600' : 'bg-gray-600'
                  }`}
                >
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4" />
                    : <User className="w-4 h-4" />
                  }
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zeo-600 text-white rounded-tr-sm'
                      : 'bg-white border border-zeo-100 text-gray-800 shadow-sm rounded-tl-sm'
                  } ${msg.streaming && !msg.content ? 'cursor-blink' : ''}`}
                >
                  {msg.role === 'assistant' ? (
                    <div className={`prose prose-sm max-w-none prose-headings:text-zeo-800 prose-a:text-zeo-600 ${msg.streaming && msg.content ? 'cursor-blink' : ''}`}>
                      <ReactMarkdown>{msg.content || ' '}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          <div className="px-4 sm:px-6 py-3 border-t border-zeo-50 bg-zeo-50/50">
            <p className="text-xs text-gray-500 mb-2">Beispielfragen:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-white border border-zeo-200 text-zeo-700 rounded-full hover:bg-zeo-100 hover:border-zeo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 sm:px-6 py-4 border-t border-zeo-100 bg-white">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Fragen Sie zu Tarifen, Fahrzeugen, Buchung…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-zeo-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zeo-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-zeo-600 text-white rounded-xl flex items-center justify-center hover:bg-zeo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Senden"
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send className="w-5 h-5" />
                }
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enter zum Senden · Shift+Enter für neue Zeile · Antworten basieren auf zeo-carsharing.de
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
