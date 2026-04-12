'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

const INITIAL_SUGGESTIONS = ['Ver precios', 'Contar mi proyecto', 'Ver portfolio']

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de Simplemente. ¿En qué te puedo ayudar?',
      suggestions: INITIAL_SUGGESTIONS,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    setInput('')
    // Remove suggestions from all previous messages when user sends a new one
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, suggestions: undefined })),
      { role: 'user', content },
    ])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10).map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!res.ok) throw new Error('Error del servidor')

      const data = await res.json() as { text: string; suggestions: string[] }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.text,
          suggestions: data.suggestions?.length ? data.suggestions : undefined,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ups, hubo un error. ¿Podés intentarlo de nuevo?',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const lastAssistantIdx = [...messages].map((m, i) => ({ m, i })).filter(({ m }) => m.role === 'assistant').at(-1)?.i ?? -1

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
        aria-label="Chat"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex max-h-[520px] w-80 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <Bot className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Asistente Simplemente</p>
              <p className="text-xs text-primary-foreground/60">En línea</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-primary-foreground'
                      : 'rounded-tl-sm bg-accent text-accent-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>

                {/* Quick reply buttons — only on last assistant message and not while loading */}
                {msg.role === 'assistant' && i === lastAssistantIdx && !loading && msg.suggestions?.length ? (
                  <div className="ml-9 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribí tu consulta..."
              className="h-9 text-sm"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              size="sm"
              className="h-9 w-9 flex-shrink-0 p-0"
              disabled={loading || !input.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
