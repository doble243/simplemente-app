import { Topbar } from '@/components/admin/Topbar'
import { KPICard } from '@/components/admin/KPICard'
import { createClient } from '@/lib/supabase/server'
import { Users, FolderKanban, FileText, UserPlus, Plus, Bell } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import Link from 'next/link'
import { formatDate, timeAgo } from '@/lib/utils/dates'
import type { CurrencyType } from '@/types/database'

const PROJECT_BADGE: Record<string, string> = {
  lead: 'badge-muted', proposal: 'badge-blue', active: 'badge-green',
  review: 'badge-yellow', completed: 'badge-purple', paused: 'badge-orange', cancelled: 'badge-muted',
}
const PROJECT_LABEL: Record<string, string> = {
  lead: 'Lead', proposal: 'Propuesta', active: 'Activo',
  review: 'Revisión', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
}
const LEAD_BADGE: Record<string, string> = {
  new: 'badge-blue', contacted: 'badge-yellow', qualified: 'badge-purple',
  proposal: 'badge-orange', won: 'badge-green', lost: 'badge-muted',
}
const LEAD_LABEL: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado',
  proposal: 'Propuesta', won: 'Ganado', lost: 'Perdido',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')

  if (isDemo) {
    return (
      <>
        <Topbar title="Dashboard" />
        <main className="page-shell">
          <div className="card-base py-12 text-center">
            <p className="text-base font-semibold text-foreground mb-1">Modo demo — sin Supabase</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Conectá Supabase actualizando <code className="bg-muted px-1 rounded">.env.local</code>
            </p>
          </div>
        </main>
      </>
    )
  }

  const [
    { count: totalClients },
    { count: activeProjects },
    { data: pendingInvoices },
    { count: newLeads },
    { data: recentProjects },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['active', 'review']),
    supabase.from('invoices').select('total, currency').in('status', ['sent', 'overdue']),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('projects')
      .select('id, name, status, progress, clients(company_name)')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('leads')
      .select('id, name, email, company, status, score, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pendingTotal = (pendingInvoices ?? []).reduce((s, i) => s + (i.total ?? 0), 0)
  const pendingCurrency: CurrencyType = 'UYU'

  // Quick actions
  const quickActions = (
    <div className="flex gap-2">
      <Link href="/clientes/nuevo"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 h-8 text-[12px] font-medium text-foreground hover:bg-accent transition-colors">
        <Plus className="h-3 w-3" />Cliente
      </Link>
      <Link href="/proyectos/nuevo"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-8 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
        <Plus className="h-3 w-3" />Proyecto
      </Link>
    </div>
  )

  return (
    <>
      <Topbar title="Dashboard" actions={quickActions} />
      <main className="page-shell space-y-6">

        {/* ── New leads alert banner ── */}
        {(newLeads ?? 0) > 0 && (
          <Link href="/leads"
            className="flex items-center gap-3 rounded-xl border-2 border-red-400/60 bg-red-50 dark:bg-red-950/20 dark:border-red-700/50 px-4 py-3.5 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors group">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white">
                <Bell className="h-4 w-4" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-red-700 dark:text-red-400">
                {newLeads === 1 ? '¡Nuevo lead!' : `¡${newLeads} leads nuevos!`}
              </p>
              <p className="text-[12px] text-red-600/70 dark:text-red-300/70">
                {newLeads === 1
                  ? 'Alguien se contactó — respondé ahora antes de que se enfríe'
                  : 'Hay consultas sin responder — respondé ahora antes de que se enfríen'}
              </p>
            </div>
            <span className="shrink-0 text-[12px] font-semibold text-red-600 dark:text-red-400 group-hover:underline">
              Ver →
            </span>
          </Link>
        )}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KPICard title="Clientes activos"    value={totalClients ?? 0}  icon={Users}       accent="primary" />
          <KPICard title="Proyectos activos"   value={activeProjects ?? 0} icon={FolderKanban} accent="violet" />
          <KPICard
            title="Por cobrar"
            value={formatCurrency(pendingTotal, pendingCurrency)}
            subtitle={`${pendingInvoices?.length ?? 0} facturas`}
            icon={FileText}
            accent={pendingTotal > 0 ? 'amber' : 'green'}
            trend={pendingTotal > 0 ? 'down' : 'neutral'}
          />
          <KPICard
            title="Leads nuevos"
            value={newLeads ?? 0}
            icon={UserPlus}
            accent={(newLeads ?? 0) > 0 ? 'red' : 'green'}
            trend={(newLeads ?? 0) > 0 ? 'up' : 'neutral'}
          />
        </div>

        {/* ── 2 col ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Proyectos recientes */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="heading-card">Proyectos recientes</p>
              <Link href="/proyectos" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-1.5">
              {(recentProjects ?? []).map((p) => {
                const client = (p.clients as unknown as { company_name: string } | null)
                return (
                  <Link key={p.id} href={`/proyectos/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{p.name}</p>
                      {client && <p className="text-[11px] text-muted-foreground truncate">{client.company_name}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5">
                        <div className="h-1 w-12 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary/50 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums w-7">{p.progress}%</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PROJECT_BADGE[p.status] ?? 'badge-muted'}`}>
                        {PROJECT_LABEL[p.status] ?? p.status}
                      </span>
                    </div>
                  </Link>
                )
              })}
              {(recentProjects ?? []).length === 0 && (
                <p className="text-[13px] text-muted-foreground py-4 text-center">Sin proyectos aún.</p>
              )}
            </div>
          </div>

          {/* Leads recientes */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="heading-card">Leads recientes</p>
              <Link href="/leads" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-1.5">
              {(recentLeads ?? []).map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{lead.name}</p>
                    <p className="text-[11px] text-muted-foreground">{timeAgo(lead.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.score != null && (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        lead.score >= 70 ? 'badge-green' :
                        lead.score >= 40 ? 'badge-yellow' : 'badge-muted'
                      }`}>
                        {lead.score}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LEAD_BADGE[lead.status] ?? 'badge-muted'}`}>
                      {LEAD_LABEL[lead.status] ?? lead.status}
                    </span>
                  </div>
                </Link>
              ))}
              {(recentLeads ?? []).length === 0 && (
                <p className="text-[13px] text-muted-foreground py-4 text-center">Sin leads aún.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
