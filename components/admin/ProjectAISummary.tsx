'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProjectAISummary({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (summary) { setOpen(o => !o); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/project-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) throw new Error('Error al generar resumen')
      const data = await res.json()
      setSummary(data.summary)
      setOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar resumen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      <button
        onClick={generate}
        disabled={loading}
        className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-accent/50 rounded-xl"
      >
        <span className="flex items-center gap-2">
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            : <Sparkles className="h-4 w-4 text-purple-500" />}
          {loading ? 'Generando resumen con IA...' : 'Resumen IA del proyecto'}
        </span>
        {summary && (open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
      </button>

      {error && (
        <p className="px-5 pb-4 text-xs text-destructive">{error}</p>
      )}

      {open && summary && (
        <div className="border-t px-5 py-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  )
}
