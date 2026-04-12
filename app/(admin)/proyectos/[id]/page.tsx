import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/Topbar'
import { ProjectAISummary } from '@/components/admin/ProjectAISummary'
import { MilestoneAgent } from '@/components/admin/MilestoneAgent'
import { QuickInvoiceButton } from '@/components/admin/QuickInvoiceButton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, Pencil, ExternalLink, CheckCircle2, Circle,
  Clock, AlertCircle, Plus, FileText,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import { formatCurrency } from '@/lib/utils/currency'
import type { MilestoneStatus, InvoiceStatus, CurrencyType } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

const milestoneIcon: Record<MilestoneStatus, typeof CheckCircle2> = {
  completed: CheckCircle2, in_progress: Clock, blocked: AlertCircle, pending: Circle,
}
const milestoneColor: Record<MilestoneStatus, string> = {
  completed: 'text-green-600', in_progress: 'text-blue-600',
  blocked: 'text-red-500', pending: 'text-muted-foreground',
}
const invoiceStatusColor: Record<InvoiceStatus, string> = {
  draft: 'badge-muted', sent: 'badge-blue', viewed: 'badge-purple',
  paid: 'badge-green', overdue: 'badge-red', cancelled: 'badge-muted',
}
const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: 'Borrador', sent: 'Enviada', viewed: 'Vista',
  paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}
const projectStatusBadge: Record<string, string> = {
  lead: 'badge-muted', proposal: 'badge-blue', active: 'badge-green',
  review: 'badge-yellow', completed: 'badge-purple',
  paused: 'badge-orange', cancelled: 'badge-muted',
}
const projectStatusLabel: Record<string, string> = {
  lead: 'Lead', proposal: 'Propuesta', active: 'Activo',
  review: 'Revisión', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
}
const projectTypeLabel: Record<string, string> = {
  web_landing: 'Landing', web_app: 'App web', ecommerce: 'E-commerce',
  branding: 'Branding', seo: 'SEO', maintenance: 'Mantenimiento',
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: project, error: projError },
    { data: milestones },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('projects').select('*, clients(id, company_name, email)').eq('id', id).single(),
    supabase.from('milestones').select('*').eq('project_id', id).order('sort_order'),
    supabase.from('invoices')
      .select('id, invoice_number, status, total, currency, issued_date, due_date')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (projError || !project) notFound()

  const client = project.clients as { id: string; company_name: string; email: string } | null
  const msList = milestones ?? []
  const invList = invoices ?? []
  const completedCount = msList.filter(m => m.status === 'completed').length
  const totalInvoiced = invList
    .filter(i => !['cancelled', 'draft'].includes(i.status))
    .reduce((s, i) => s + Number(i.total), 0)

  const newInvoiceUrl = `/facturas/nueva?projectId=${id}&clientId=${client?.id ?? ''}&projectName=${encodeURIComponent(project.name)}`
  const currency = (project.currency ?? 'USD') as CurrencyType

  return (
    <>
      <Topbar title={project.name} />
      <main className="page-shell">
        <div className="page-narrow section-gap">

          {/* Nav */}
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground h-8 px-2">
              <Link href="/proyectos">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-sm">Proyectos</span>
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <Link href={`/proyectos/${id}/editar`}>
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
              </Button>
              <QuickInvoiceButton
                projectId={id}
                hasBudget={!!project.budget}
                size="sm"
              />
            </div>
          </div>

          {/* ── Desktop 2-col / Mobile stack ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">

            {/* ── LEFT col (lg: 3/5) ── */}
            <div className="space-y-4 lg:col-span-3">

              {/* Project card */}
              <div className="card-elevated p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h1 className="heading-page truncate">{project.name}</h1>
                    {client && (
                      <Link href={`/clientes/${client.id}`} className="link-primary text-sm block">
                        {client.company_name}
                      </Link>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {project.type && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                          {projectTypeLabel[project.type] ?? project.type}
                        </span>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-primary transition-colors max-w-[180px]">
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{project.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${projectStatusBadge[project.status] ?? 'badge-muted'}`}>
                    {projectStatusLabel[project.status] ?? project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="label-xs">Progreso</span>
                    <span className="text-sm font-bold text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {project.start_date && (
                    <div className="card-stat">
                      <p className="label-xs mb-1">Inicio</p>
                      <p className="text-sm font-semibold">{formatDate(project.start_date)}</p>
                    </div>
                  )}
                  {project.end_date && (
                    <div className="card-stat">
                      <p className="label-xs mb-1">Entrega</p>
                      <p className="text-sm font-semibold">{formatDate(project.end_date)}</p>
                    </div>
                  )}
                  {project.budget ? (
                    <div className="card-stat">
                      <p className="label-xs mb-1">Presupuesto</p>
                      <p className="text-sm font-semibold">{formatCurrency(project.budget, currency)}</p>
                    </div>
                  ) : null}
                  {totalInvoiced > 0 && (
                    <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 sm:p-4">
                      <p className="label-xs mb-1 text-green-700/60 dark:text-green-300/60">Facturado</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(totalInvoiced, currency)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="card-base overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                  <h2 className="heading-card flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Facturas
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{invList.length}</span>
                  </h2>
                  <QuickInvoiceButton projectId={id} hasBudget={!!project.budget} size="sm" />
                </div>

                {invList.length === 0 ? (
                  <div className="px-5 py-8 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">Sin facturas para este proyecto.</p>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <Link href={newInvoiceUrl}><Plus className="h-3.5 w-3.5" />Crear primera factura</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {invList.map(inv => (
                      <Link key={inv.id} href={`/facturas/${inv.id}`}
                        className="flex items-center justify-between px-5 py-3 interactive">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{inv.invoice_number}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${invoiceStatusColor[inv.status as InvoiceStatus] ?? 'badge-muted'}`}>
                            {invoiceStatusLabel[inv.status as InvoiceStatus] ?? inv.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          {inv.due_date && <span className="hidden md:block text-xs text-muted-foreground">{formatDate(inv.due_date)}</span>}
                          <span className="text-sm font-bold text-foreground">{formatCurrency(Number(inv.total), inv.currency as CurrencyType)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT col (lg: 2/5) ── */}
            <div className="space-y-4 lg:col-span-2">

              {/* Milestones */}
              <div className="card-base overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
                  <div>
                    <h2 className="heading-card">Hitos</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{completedCount} de {msList.length} completados</p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <Link href={`/proyectos/${id}/editar#milestones`}>
                      <Pencil className="h-3 w-3" />Editar
                    </Link>
                  </Button>
                </div>

                <div className="divide-y divide-border/60 px-4">
                  {msList.length === 0 && (
                    <p className="text-sm text-muted-foreground py-6 text-center">Sin hitos.</p>
                  )}
                  {msList.map(m => {
                    const Icon = milestoneIcon[m.status as MilestoneStatus] ?? Circle
                    const color = milestoneColor[m.status as MilestoneStatus] ?? 'text-muted-foreground'
                    return (
                      <div key={m.id} className="py-3">
                        <div className="flex items-start gap-2.5">
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${m.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {m.title}
                            </p>
                            {m.due_date && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Vence {formatDate(m.due_date)}
                              </p>
                            )}
                            <MilestoneAgent
                              taskTitle={m.title}
                              projectName={project.name}
                              projectType={project.type ?? undefined}
                              projectDescription={project.description ?? undefined}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Summary */}
              <ProjectAISummary projectId={id} />

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
