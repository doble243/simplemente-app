import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { Progress } from '@/components/ui/progress'
import { ProjectsMobileList } from '@/components/admin/ProjectsMobileList'

const STATUS_COLS = [
  { key: 'lead',      label: 'Lead',       accent: 'border-t-blue-400' },
  { key: 'proposal',  label: 'Propuesta',  accent: 'border-t-violet-400' },
  { key: 'active',    label: 'Activo',     accent: 'border-t-emerald-400' },
  { key: 'review',    label: 'Revisión',   accent: 'border-t-amber-400' },
  { key: 'completed', label: 'Completado', accent: 'border-t-slate-300' },
]

const STATUS_DOT: Record<string, string> = {
  lead:      'bg-blue-400',
  proposal:  'bg-violet-400',
  active:    'bg-emerald-400',
  review:    'bg-amber-400',
  completed: 'bg-slate-400',
  paused:    'bg-orange-400',
  cancelled: 'bg-red-400',
}

const TYPE_LABEL: Record<string, string> = {
  web_landing: 'Landing', web_app: 'App web', ecommerce: 'E-commerce',
  branding: 'Branding', seo: 'SEO', maintenance: 'Mtto.',
}

export default async function ProyectosPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, progress, type, budget, currency, clients(id, company_name)')
    .order('updated_at', { ascending: false })

  const allProjects = ((projects ?? []) as unknown[]) as Array<{
    id: string; name: string; status: string; progress: number
    type: string; budget: number | null; currency: string
    clients: { id: string; company_name: string } | null
  }>

  const byStatus = STATUS_COLS.reduce((acc, col) => {
    acc[col.key] = allProjects.filter(p => p.status === col.key)
    return acc
  }, {} as Record<string, typeof allProjects>)

  const newBtn = (
    <Link
      href="/proyectos/nuevo"
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-8 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />Nuevo
    </Link>
  )

  return (
    <>
      <Topbar title="Proyectos" actions={newBtn} />
      <main className="page-shell">

        {/* ── MOBILE: tabs + list (hidden on md+) ── */}
        <div className="md:hidden">
          <ProjectsMobileList projects={allProjects} statusDot={STATUS_DOT} typeLabel={TYPE_LABEL} />
        </div>

        {/* ── DESKTOP: Kanban (hidden on mobile) ── */}
        <div className="hidden md:block">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground">{allProjects.length} proyectos</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STATUS_COLS.map(col => (
              <div key={col.key} className="w-60 shrink-0">
                <div className={`rounded-xl border-t-2 ${col.accent} bg-muted/30 p-3`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {col.label}
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {byStatus[col.key]?.length ?? 0}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(byStatus[col.key] ?? []).map(p => (
                      <Link key={p.id} href={`/proyectos/${p.id}`}
                        className="block rounded-lg border bg-card p-3 hover:shadow-sm transition-all">
                        <p className="text-[13px] font-semibold text-foreground leading-snug mb-0.5">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mb-2">
                          {p.clients?.company_name}
                          {p.type && <span className="ml-1.5 opacity-60">· {TYPE_LABEL[p.type] ?? p.type}</span>}
                        </p>
                        <Progress value={p.progress} className="h-1" />
                        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{p.progress}%</p>
                      </Link>
                    ))}
                    {(byStatus[col.key] ?? []).length === 0 && (
                      <p className="py-4 text-center text-[11px] text-muted-foreground/50">—</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
