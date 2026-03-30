'use client'

import { type ReactNode } from 'react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  children: ReactNode
  timestamp?: string
  isStreaming?: boolean
  className?: string
}

export default function ChatBubble({
  role,
  children,
  timestamp,
  isStreaming = false,
  className = '',
}: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 animate-fade-in-up ${className}`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-warm-sm" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'max-w-[80%]' : ''}`}>
        <div
          className={`
            px-4 py-3 text-sm leading-relaxed font-body
            ${isUser
              ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm shadow-warm-sm'
              : 'bg-white border border-surface-200 text-surface-800 rounded-2xl rounded-bl-sm shadow-warm-sm'
            }
            ${isStreaming ? 'cursor-blink' : ''}
          `}
        >
          {children}
        </div>

        {timestamp && (
          <p className={`text-xs text-surface-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2.5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-warm-sm" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
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
  )
}
