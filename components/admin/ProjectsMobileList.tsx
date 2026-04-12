'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { QuickInvoiceButton } from '@/components/admin/QuickInvoiceButton'
import { Pencil, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'
import { cn } from '@/lib/utils'

interface Project {
  id: string; name: string; status: string; progress: number
  type: string; budget: number | null; currency: string
  clients: { id: string; company_name: string } | null
}

interface Props {
  projects: Project[]
  statusDot: Record<string, string>
  typeLabel: Record<string, string>
}

const TABS = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activo' },
  { key: 'lead',      label: 'Lead' },
  { key: 'proposal',  label: 'Propuesta' },
  { key: 'review',    label: 'Revisión' },
  { key: 'completed', label: 'Listo' },
]

const STATUS_LABEL: Record<string, string> = {
  lead: 'Lead', proposal: 'Propuesta', active: 'Activo',
  review: 'Revisión', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
}

export function ProjectsMobileList({ projects, statusDot, typeLabel }: Props) {
  const [tab, setTab] = useState('all')

  const visible = tab === 'all' ? projects : projects.filter(p => p.status === tab)
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? projects.length : projects.filter(p => p.status === t.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-3">
      {/* Filter tabs — horizontal scroll */}
      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-1.5 pb-1" style={{ width: 'max-content' }}>
          {TABS.map(t => (
            counts[t.key] > 0 || t.key === 'all' ? (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'h-8 rounded-full px-3 text-[12px] font-semibold transition-colors whitespace-nowrap',
                  tab === t.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                )}
              >
                {t.label}
                {counts[t.key] > 0 && (
                  <span className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0 text-[10px]',
                    tab === t.key ? 'bg-white/20' : 'bg-muted-foreground/10'
                  )}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ) : null
          ))}
        </div>
      </div>

      {/* Project cards */}
      {visible.length === 0 && (
        <div className="rounded-xl border bg-card py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin proyectos en este estado.</p>
        </div>
      )}

      {visible.map(p => (
        <div key={p.id} className="card-elevated overflow-hidden">
          {/* Top row: status + name */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', statusDot[p.status] ?? 'bg-muted-foreground')} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              {p.type && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {typeLabel[p.type] ?? p.type}
                </span>
              )}
            </div>

            <Link href={`/proyectos/${p.id}`} className="block">
              <h3 className="text-[15px] font-bold text-foreground leading-snug tracking-tight">{p.name}</h3>
              {p.clients && (
                <p className="mt-0.5 text-[12px] text-muted-foreground">{p.clients.company_name}</p>
              )}
            </Link>

            {/* Progress */}
            <div className="mt-3 flex items-center gap-2.5">
              <Progress value={p.progress} className="h-1.5 flex-1" />
              <span className="shrink-0 text-[12px] font-bold tabular-nums text-foreground">{p.progress}%</span>
            </div>

            {/* Budget */}
            {p.budget && (
              <p className="mt-1.5 text-[12px] text-muted-foreground tabular-nums">
                Presupuesto: <span className="font-semibold text-foreground">{formatCurrency(p.budget, (p.currency ?? 'USD') as CurrencyType)}</span>
              </p>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-2.5">
            <QuickInvoiceButton projectId={p.id} hasBudget={!!p.budget} size="sm" className="flex-1" />
            <Link
              href={`/proyectos/${p.id}`}
              className="flex h-7 items-center gap-1 rounded-lg border border-border/80 bg-card px-2.5 text-[12px] font-medium text-foreground hover:bg-accent/60 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />Ver
            </Link>
            <Link
              href={`/proyectos/${p.id}/editar`}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground hover:bg-accent/60 transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
