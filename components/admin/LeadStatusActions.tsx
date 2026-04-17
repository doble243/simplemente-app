'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props {
  leadId: string
  currentStatus: string
}

const ALL_STATUSES = [
  { key: 'new',       label: 'Nuevo',       badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300' },
  { key: 'contacted', label: 'Contactado',   badge: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800/40 dark:bg-yellow-950/20 dark:text-yellow-300' },
  { key: 'qualified', label: 'Calificado',   badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-300' },
  { key: 'proposal',  label: 'Propuesta',    badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/20 dark:text-orange-300' },
  { key: 'won',       label: 'Ganado ✓',     badge: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300' },
  { key: 'lost',      label: 'Perdido',      badge: 'border-border bg-muted text-muted-foreground' },
]

export function LeadStatusActions({ leadId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function changeStatus(newStatus: string) {
    if (newStatus === currentStatus) return
    setLoading(newStatus)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="card-base p-4">
      <p className="heading-card mb-3">Mover en pipeline</p>
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map(s => {
          const isActive = s.key === currentStatus
          const isLoading = loading === s.key
          return (
            <button
              key={s.key}
              onClick={() => changeStatus(s.key)}
              disabled={isActive || !!loading}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all
                ${isActive
                  ? `${s.badge} ring-2 ring-current ring-offset-1 opacity-100`
                  : `${s.badge} opacity-60 hover:opacity-100`
                }
                disabled:cursor-default`}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {s.label}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
    </div>
  )
}
