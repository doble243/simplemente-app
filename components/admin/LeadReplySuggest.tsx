'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, RefreshCw, MessageCircle, Mail, Loader2, ChevronDown } from 'lucide-react'
import { whatsAppURL, mailtoURL } from '@/lib/utils/contact'

interface Props {
  leadId:  string
  name:    string
  phone?:  string | null
  email?:  string | null
}

type Channel = 'whatsapp' | 'email'

export function LeadReplySuggest({ leadId, name, phone, email }: Props) {
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [text, setText]         = useState('')
  const [channel, setChannel]   = useState<Channel>('whatsapp')
  const [copied, setCopied]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Prefer whatsapp if phone exists, else email
  const effectiveChannel: Channel = channel === 'whatsapp' && !phone ? 'email' : channel

  async function generate(ch: Channel = effectiveChannel) {
    setLoading(true)
    setError(null)
    setText('')
    try {
      const res = await fetch('/api/ai/reply-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, channel: ch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setText(data.text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la sugerencia')
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    if (!text && !loading) generate()
  }

  async function copyText() {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function sendViaChannel() {
    if (!text) return
    if (effectiveChannel === 'whatsapp' && phone) {
      window.open(whatsAppURL(phone, text), '_blank')
    } else if (email) {
      window.open(mailtoURL(email, `Simplemente — ${name}`, text), '_blank')
    }
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Sugerencia de respuesta IA
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
    )
  }

  return (
    <div className="card-base border-primary/20 bg-primary/3 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-[13px] font-semibold text-foreground">Respuesta sugerida por IA</p>
        </div>
        {/* Channel toggle */}
        <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
          {phone && (
            <button
              onClick={() => { setChannel('whatsapp'); generate('whatsapp') }}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors
                ${effectiveChannel === 'whatsapp' ? 'bg-[#25D366] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MessageCircle className="h-3 w-3" />WA
            </button>
          )}
          {email && (
            <button
              onClick={() => { setChannel('email'); generate('email') }}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors
                ${effectiveChannel === 'email' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Mail className="h-3 w-3" />Email
            </button>
          )}
        </div>
      </div>

      {/* Text area */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Redactando respuesta...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-destructive/10 px-3 py-2">
          <p className="text-[12px] text-destructive">{error}</p>
          <button onClick={() => generate()} className="mt-1 text-[12px] text-primary hover:underline">
            Intentar de nuevo
          </button>
        </div>
      ) : text ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-[13px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      ) : null}

      {/* Actions */}
      {text && !loading && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Send button — primary */}
          <button
            onClick={sendViaChannel}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold text-white transition-colors
              ${effectiveChannel === 'whatsapp'
                ? 'bg-[#25D366] hover:bg-[#20b558]'
                : 'bg-primary hover:bg-primary/90'
              }`}
          >
            {effectiveChannel === 'whatsapp'
              ? <><MessageCircle className="h-3.5 w-3.5" />Enviar por WhatsApp</>
              : <><Mail className="h-3.5 w-3.5" />Abrir en Email</>
            }
          </button>

          {/* Copy */}
          <button
            onClick={copyText}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {copied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copiado</> : <><Copy className="h-3.5 w-3.5" />Copiar</>}
          </button>

          {/* Regenerate */}
          <button
            onClick={() => generate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />Regenerar
          </button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50">
        Podés editar el texto antes de enviarlo.
      </p>
    </div>
  )
}
