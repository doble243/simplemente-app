'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  is_from_client: boolean
  created_at: string
  read_at: string | null
}

export default function PortalMensajesPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [senderId, setSenderId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setSenderId(user.id)

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!client) return
      setClientId(client.id)

      // Load messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, content, is_from_client, created_at, read_at')
        .eq('client_id', client.id)
        .order('created_at')

      setMessages(msgs ?? [])

      // Mark unread messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('client_id', client.id)
        .eq('is_from_client', false)
        .is('read_at', null)

      // Subscribe to new messages
      supabase
        .channel(`messages:${client.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `client_id=eq.${client.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !clientId || !senderId || sending) return
    setSending(true)

    await supabase.from('messages').insert({
      client_id: clientId,
      sender_id: senderId,
      content: input.trim(),
      is_from_client: true,
    })

    setInput('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <h1 className="text-xl font-bold text-foreground mb-4">Mensajes</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.is_from_client ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
              msg.is_from_client ? 'bg-black text-white' : 'bg-muted'
            }`}>
              {msg.is_from_client ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.is_from_client
                ? 'bg-black text-white rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Todavía no hay mensajes. ¡Mandanos una consulta!
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Escribí tu mensaje... (Enter para enviar)"
          rows={2}
          className="resize-none"
          disabled={sending}
        />
        <Button
          onClick={sendMessage}
          className="self-end h-10 w-10 p-0 flex-shrink-0"
          disabled={sending || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
