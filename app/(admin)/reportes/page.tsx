import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { TrendingUp, Users, FolderKanban, FileText, UserPlus } from 'lucide-react'
import type { CurrencyType } from '@/types/database'

export default async function ReportesPage() {
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')

  if (isDemo) {
    return (
      <>
        <Topbar title="Reportes" />
        <main className="p-6">
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
            <p className="text-sm text-muted-foreground">Conectá Supabase para ver los reportes reales.</p>
          </div>
        </main>
      </>
    )
  }

  const supabase = await createClient()

  const [
    { count: totalClients },
    { count: totalProjects },
    { count: totalLeads },
    { data: invoices },
    { data: leadsByStatus },
    { data: projectsByStatus },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('total, currency, status'),
    supabase.from('leads').select('status').order('status'),
    supabase.from('projects').select('status').order('status'),
  ])

  const totalRevenue = (invoices ?? [])
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.total ?? 0), 0)

  const pendingRevenue = (invoices ?? [])
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + (i.total ?? 0), 0)

  // Lead funnel
  const leadCounts: Record<string, number> = {}
  for (const l of (leadsByStatus ?? [])) {
    leadCounts[l.status] = (leadCounts[l.status] ?? 0) + 1
  }

  const projectCounts: Record<string, number> = {}
  for (const p of (projectsByStatus ?? [])) {
    projectCounts[p.status] = (projectCounts[p.status] ?? 0) + 1
  }

  const kpis = [
    { label: 'Total clientes', value: String(totalClients ?? 0), icon: Users },
    { label: 'Total proyectos', value: String(totalProjects ?? 0), icon: FolderKanban },
    { label: 'Total leads', value: String(totalLeads ?? 0), icon: UserPlus },
    { label: 'Ingresos cobrados (USD)', value: formatCurrency(totalRevenue, 'USD'), icon: FileText },
    { label: 'Por cobrar (USD)', value: formatCurrency(pendingRevenue, 'USD'), icon: TrendingUp },
  ]

  const leadStages = [
    { key: 'new', label: 'Nuevos' },
    { key: 'contacted', label: 'Contactados' },
    { key: 'qualified', label: 'Calificados' },
    { key: 'proposal', label: 'Propuesta' },
    { key: 'won', label: 'Ganados' },
    { key: 'lost', label: 'Perdidos' },
  ]

  const projectStatuses = [
    { key: 'lead', label: 'Lead' },
    { key: 'proposal', label: 'Propuesta' },
    { key: 'active', label: 'Activo' },
    { key: 'review', label: 'Revisión' },
    { key: 'completed', label: 'Completado' },
    { key: 'paused', label: 'Pausado' },
  ]

  return (
    <>
      <Topbar title="Reportes" />
      <main className="p-6 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lead funnel */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Pipeline de leads</h2>
            <div className="space-y-2">
              {leadStages.map(({ key, label }) => {
                const count = leadCounts[key] ?? 0
                const max = Math.max(...Object.values(leadCounts), 1)
                const pct = Math.round((count / max) * 100)
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-black transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Projects by status */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Proyectos por estado</h2>
            <div className="space-y-2">
              {projectStatuses.map(({ key, label }) => {
                const count = projectCounts[key] ?? 0
                const max = Math.max(...Object.values(projectCounts), 1)
                const pct = Math.round((count / max) * 100)
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gray-800 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
