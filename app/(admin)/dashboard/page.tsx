import { Topbar } from '@/components/admin/Topbar'
import { KPICard } from '@/components/admin/KPICard'
import { createClient } from '@/lib/supabase/server'
import { Users, FolderKanban, FileText, UserPlus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/dates'

export default async function DashboardPage() {
  const supabase = await createClient()
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')

  if (isDemo) {
    return (
      <>
        <Topbar title="Dashboard" />
        <main className="p-6">
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Conectá Supabase actualizando el archivo <code className="bg-muted px-1 rounded">.env.local</code> con tus credenciales reales.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 max-w-2xl mx-auto text-left">
              {[
                { title: 'Clientes activos', value: '4', icon: Users },
                { title: 'Proyectos activos', value: '4', icon: FolderKanban },
                { title: 'Facturas pendientes', value: 'USD 0', icon: FileText },
                { title: 'Leads nuevos', value: '0', icon: UserPlus },
              ].map(({ title, value, icon }) => (
                <KPICard key={title} title={title} value={value} icon={icon} />
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  // Parallel queries for KPIs
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
      .limit(5),
    supabase
      .from('leads')
      .select('id, name, email, status, score, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pendingTotal = (pendingInvoices ?? []).reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    review: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-600',
    paused: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-600',
    lead: 'bg-blue-100 text-blue-700',
    proposal: 'bg-purple-100 text-purple-700',
  }

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="p-6 space-y-8">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            title="Clientes activos"
            value={totalClients ?? 0}
            icon={Users}
          />
          <KPICard
            title="Proyectos activos"
            value={activeProjects ?? 0}
            icon={FolderKanban}
          />
          <KPICard
            title="Facturas pendientes"
            value={formatCurrency(pendingTotal, 'USD')}
            subtitle={`${pendingInvoices?.length ?? 0} facturas`}
            icon={FileText}
            trend={pendingTotal > 0 ? 'down' : 'neutral'}
          />
          <KPICard
            title="Leads nuevos"
            value={newLeads ?? 0}
            icon={UserPlus}
            trend={(newLeads ?? 0) > 0 ? 'up' : 'neutral'}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent projects */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Proyectos recientes</h2>
              <Link href="/proyectos" className="text-xs text-muted-foreground hover:text-primary">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {(recentProjects ?? []).map((p) => (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(p.clients as unknown as { company_name: string } | null)?.company_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </div>
                </Link>
              ))}
              {(recentProjects ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Sin proyectos aún.</p>
              )}
            </div>
          </div>

          {/* Recent leads */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Leads recientes</h2>
              <Link href="/leads" className="text-xs text-muted-foreground hover:text-primary">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {(recentLeads ?? []).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.score != null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        lead.score >= 70 ? 'text-green-700 bg-green-100' :
                        lead.score >= 40 ? 'text-yellow-700 bg-yellow-100' :
                        'text-muted-foreground bg-muted'
                      }`}>
                        {lead.score}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">{lead.status}</Badge>
                  </div>
                </Link>
              ))}
              {(recentLeads ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Sin leads aún.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
