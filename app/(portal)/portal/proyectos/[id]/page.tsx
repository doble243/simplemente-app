import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import type { MilestoneStatus } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

const msIcon: Record<MilestoneStatus, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  blocked: AlertCircle,
  pending: Circle,
}
const msColor: Record<MilestoneStatus, string> = {
  completed: 'text-green-600',
  in_progress: 'text-blue-600',
  blocked: 'text-red-500',
  pending: 'text-gray-300',
}

export default async function PortalProjectPage({ params }: Props) {
  const { id } = await params
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')
  if (isDemo) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
        <p className="text-sm text-muted-foreground">Conectá Supabase para ver el detalle del proyecto.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase.from('clients').select('id').eq('profile_id', user.id).single()
  if (!client) redirect('/portal')

  const [{ data: project }, { data: milestones }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).eq('client_id', client.id).single(),
    supabase.from('milestones').select('*').eq('project_id', id).order('sort_order'),
  ])

  if (!project) notFound()

  const completed = (milestones ?? []).filter(m => m.status === 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-500 hover:underline mt-1">
            {project.url} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Progress */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Progreso general</h2>
          <Badge variant="outline">{project.status}</Badge>
        </div>
        <Progress value={project.progress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">{project.progress}% completado · {completed}/{milestones?.length ?? 0} hitos</p>
        {project.description && <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{project.description}</p>}
      </div>

      {/* Milestones */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Hitos del proyecto</h2>
        <div className="space-y-3">
          {(milestones ?? []).map((m) => {
            const Icon = msIcon[m.status as MilestoneStatus] ?? Circle
            const color = msColor[m.status as MilestoneStatus] ?? 'text-gray-300'
            return (
              <div key={m.id} className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${m.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {m.title}
                  </p>
                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  {m.due_date && m.status !== 'completed' && (
                    <p className="text-xs text-muted-foreground mt-0.5">Estimado: {formatDate(m.due_date)}</p>
                  )}
                  {m.completed_at && (
                    <p className="text-xs text-green-600 mt-0.5">Completado: {formatDate(m.completed_at)}</p>
                  )}
                </div>
              </div>
            )
          })}
          {(milestones ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Sin hitos definidos aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
