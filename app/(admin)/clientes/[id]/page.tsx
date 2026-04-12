import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Hash, Plus, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

const clientStatusBadge: Record<string, string> = {
  active: 'badge-green', prospect: 'badge-blue', inactive: 'badge-muted',
}
const clientStatusLabel: Record<string, string> = {
  active: 'Activo', prospect: 'Prospecto', inactive: 'Inactivo',
}
const invoiceStatusBadge: Record<string, string> = {
  draft: 'badge-muted', sent: 'badge-blue', viewed: 'badge-purple',
  paid: 'badge-green', overdue: 'badge-red', cancelled: 'badge-muted',
}
const invoiceStatusLabel: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', viewed: 'Vista',
  paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}
const projectStatusBadge: Record<string, string> = {
  lead: 'badge-muted', proposal: 'badge-blue', active: 'badge-green',
  review: 'badge-yellow', completed: 'badge-purple', paused: 'badge-orange', cancelled: 'badge-muted',
}
const projectStatusLabel: Record<string, string> = {
  lead: 'Lead', proposal: 'Propuesta', active: 'Activo',
  review: 'Revisión', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: client, error: clientError },
    { data: projects },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('projects')
      .select('id, name, status, progress, type, budget, currency')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('invoices')
      .select('id, invoice_number, status, total, currency, issued_date, due_date')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (clientError || !client) notFound()

  const projectList = projects ?? []
  const invoiceList = invoices ?? []
  const totalPaid = invoiceList.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const totalPending = invoiceList.filter(i => ['sent','overdue'].includes(i.status)).reduce((s, i) => s + Number(i.total), 0)

  return (
    <>
      <Topbar title={client.company_name} />
      <main className="page-shell">
        <div className="page-wide section-gap">

          {/* Nav */}
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground h-8 px-2">
              <Link href="/clientes">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-sm">Clientes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
              <Link href={`/clientes/${id}/editar`}>
                <Pencil className="h-3.5 w-3.5" />Editar
              </Link>
            </Button>
          </div>

          {/* ── Desktop 2-col / Mobile stack ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

            {/* ── LEFT: Client info (lg: 2/5) ── */}
            <div className="space-y-4 lg:col-span-2">
              <div className="card-elevated p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="heading-page truncate">{client.company_name}</h1>
                    {client.rut && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Hash className="h-3 w-3" />RUT {client.rut}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${clientStatusBadge[client.status] ?? 'badge-muted'}`}>
                    {clientStatusLabel[client.status] ?? client.status}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <a href={`mailto:${client.email}`}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{client.email}</span>
                  </a>
                  {client.phone && (
                    <a href={`tel:${client.phone}`}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      {client.phone}
                    </a>
                  )}
                  {(client.city || client.country) && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      {[client.address, client.city, client.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="card-stat">
                    <p className="label-xs mb-1">Proyectos</p>
                    <p className="stat-value text-xl">{projectList.length}</p>
                  </div>
                  <div className="card-stat">
                    <p className="label-xs mb-1">Facturas</p>
                    <p className="stat-value text-xl">{invoiceList.length}</p>
                  </div>
                  {totalPaid > 0 && (
                    <div className="col-span-2 rounded-xl bg-green-50 dark:bg-green-900/20 p-3">
                      <p className="label-xs mb-1 text-green-700/60 dark:text-green-300/60">Total cobrado</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400 tabular-nums">
                        {formatCurrency(totalPaid, 'USD')}
                      </p>
                    </div>
                  )}
                  {totalPending > 0 && (
                    <div className="col-span-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-3">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                        <p className="label-xs text-yellow-700/70 dark:text-yellow-300/70">Por cobrar</p>
                      </div>
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400 tabular-nums mt-1">
                        {formatCurrency(totalPending, 'USD')}
                      </p>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">{client.notes}</p>
                )}
              </div>
            </div>

            {/* ── RIGHT: Tabs (lg: 3/5) ── */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="proyectos">
                <TabsList className="w-full sm:w-auto mb-4">
                  <TabsTrigger value="proyectos" className="flex-1 sm:flex-none">
                    Proyectos <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">{projectList.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="facturas" className="flex-1 sm:flex-none">
                    Facturas <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">{invoiceList.length}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="proyectos" className="space-y-2.5">
                  {projectList.map((p) => (
                    <Link key={p.id} href={`/proyectos/${p.id}`}
                      className="card-base flex items-center justify-between p-4 interactive">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        {p.budget && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatCurrency(p.budget, (p.currency ?? 'USD') as CurrencyType)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <div className="hidden sm:flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">{p.progress}%</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${projectStatusBadge[p.status] ?? 'badge-muted'}`}>
                          {projectStatusLabel[p.status] ?? p.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {projectList.length === 0 && (
                    <div className="card-base py-10 text-center">
                      <p className="text-sm text-muted-foreground mb-3">Sin proyectos todavía.</p>
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto mt-1">
                    <Link href={`/proyectos/nuevo?client=${id}`}><Plus className="h-3.5 w-3.5" />Nuevo proyecto</Link>
                  </Button>
                </TabsContent>

                <TabsContent value="facturas" className="space-y-2.5">
                  {invoiceList.map((inv) => (
                    <Link key={inv.id} href={`/facturas/${inv.id}`}
                      className="card-base flex items-center justify-between p-4 interactive">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(inv.issued_date)}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          {formatCurrency(inv.total, inv.currency as CurrencyType)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${invoiceStatusBadge[inv.status] ?? 'badge-muted'}`}>
                          {invoiceStatusLabel[inv.status] ?? inv.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {invoiceList.length === 0 && (
                    <div className="card-base py-10 text-center">
                      <p className="text-sm text-muted-foreground">Sin facturas.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
