import Link from 'next/link'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/dates'
import { LeadContactButtons } from '@/components/admin/LeadContactButtons'

const PIPELINE = [
  { key: 'new',       label: 'Nuevos',     badge: 'badge-blue'   },
  { key: 'contacted', label: 'Contactados', badge: 'badge-yellow' },
  { key: 'qualified', label: 'Calificados', badge: 'badge-purple' },
  { key: 'proposal',  label: 'Propuesta',   badge: 'badge-orange' },
  { key: 'won',       label: 'Ganados',     badge: 'badge-green'  },
]

const DOT_COLOR: Record<string, string> = {
  new: 'bg-blue-500', contacted: 'bg-yellow-500', qualified: 'bg-purple-500',
  proposal: 'bg-orange-500', won: 'bg-green-500',
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, phone, company, source, status, score, next_action, created_at')
    .not('status', 'eq', 'lost')
    .order('created_at', { ascending: false })

  const list = leads ?? []
  const byStatus = PIPELINE.reduce((acc, col) => {
    acc[col.key] = list.filter(l => l.status === col.key)
    return acc
  }, {} as Record<string, typeof list>)

  return (
    <>
      <Topbar title="Leads" />
      <main className="page-shell">

        <p className="text-[12px] text-muted-foreground mb-4">{list.length} leads activos</p>

        {/* ── Mobile: lista vertical con estado ── */}
        <div className="space-y-2 md:hidden">
          {list.length === 0 && (
            <div className="card-base py-10 text-center">
              <p className="text-sm text-muted-foreground">Sin leads todavía.</p>
            </div>
          )}
          {list.map(lead => {
            const col = PIPELINE.find(p => p.key === lead.status)
            const isNew = lead.status === 'new'
            return (
              <div key={lead.id}
                className={`card-base p-3.5 space-y-2.5 ${isNew ? 'border-red-300/60 dark:border-red-700/40 bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                {/* Top row */}
                <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 interactive">
                  {/* Score circle */}
                  <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-bold ${
                    (lead.score ?? 0) >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    (lead.score ?? 0) >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    isNew ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {lead.score ?? (isNew ? '!' : '—')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] font-bold truncate ${isNew ? 'text-foreground' : 'text-foreground'}`}>
                        {lead.name}
                        {isNew && <span className="ml-1.5 text-red-500 text-[11px] font-bold">● NUEVO</span>}
                      </p>
                      {col && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${col.badge}`}>
                          {col.label}
                        </span>
                      )}
                    </div>
                    {lead.company && <p className="text-[12px] text-muted-foreground truncate">{lead.company}</p>}
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatDate(lead.created_at)}</p>
                  </div>
                </Link>
                {/* Quick contact buttons */}
                {(lead.phone || lead.email) && (
                  <LeadContactButtons name={lead.name} phone={lead.phone} email={lead.email} size="sm" />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Desktop: Kanban ── */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {PIPELINE.map(col => (
            <div key={col.key} className="shrink-0 w-60">
              <div className="card-base p-3">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${DOT_COLOR[col.key]}`} />
                  <p className="label-xs">{col.label}</p>
                  <span className="ml-auto text-[11px] text-muted-foreground font-semibold">
                    {byStatus[col.key]?.length ?? 0}
                  </span>
                </div>
                {/* Cards */}
                <div className="space-y-2">
                  {(byStatus[col.key] ?? []).map(lead => {
                    const isNew = lead.status === 'new'
                    return (
                      <div key={lead.id}
                        className={`rounded-lg border p-3 transition-all hover:shadow-sm
                          ${isNew
                            ? 'border-red-300/60 dark:border-red-700/40 bg-red-50/40 dark:bg-red-950/10 hover:border-red-400/60'
                            : 'bg-background border-border/60 hover:border-primary/30'
                          }`}>
                        <Link href={`/leads/${lead.id}`} className="block">
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
                              {lead.name}
                              {isNew && <span className="ml-1 text-red-500 text-[10px] font-bold">●</span>}
                            </p>
                            {lead.score != null && (
                              <span className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                lead.score >= 70 ? 'badge-green' :
                                lead.score >= 40 ? 'badge-yellow' : 'badge-muted'
                              }`}>
                                {lead.score}
                              </span>
                            )}
                          </div>
                          {lead.company && (
                            <p className="text-[11px] text-muted-foreground mb-1">{lead.company}</p>
                          )}
                          {lead.next_action && (
                            <p className="text-[11px] text-primary/80 line-clamp-1 mt-1">{lead.next_action}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/50 mt-1.5">{formatDate(lead.created_at)}</p>
                        </Link>
                        {/* Quick contact */}
                        {(lead.phone || lead.email) && (
                          <div className="mt-2 pt-2 border-t border-border/40">
                            <LeadContactButtons name={lead.name} phone={lead.phone} email={lead.email} size="sm" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {(byStatus[col.key] ?? []).length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border/40 py-6 text-center">
                      <p className="text-[11px] text-muted-foreground/50">Vacío</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
