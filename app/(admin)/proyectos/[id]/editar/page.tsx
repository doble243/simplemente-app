'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  web_landing: 'Landing page', web_app: 'Aplicación web', ecommerce: 'E-commerce',
  branding: 'Branding', seo: 'SEO', maintenance: 'Mantenimiento',
}
const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead', proposal: 'Propuesta', active: 'Activo',
  review: 'Revisión', completed: 'Completado', paused: 'Pausado', cancelled: 'Cancelado',
}
const MILESTONE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado', blocked: 'Bloqueado',
}

interface Milestone {
  id?: string
  title: string
  status: string
  due_date: string
  _delete?: boolean
}

export default function EditarProyectoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Form state
  const [name, setName]         = useState('')
  const [description, setDesc]  = useState('')
  const [type, setType]         = useState('web_landing')
  const [status, setStatus]     = useState('active')
  const [currency, setCurrency] = useState('USD')
  const [budget, setBudget]     = useState('')
  const [url, setUrl]           = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]   = useState('')
  const [progress, setProgress] = useState(0)
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    async function load() {
      const [{ data: project }, { data: ms }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('milestones').select('*').eq('project_id', id).order('sort_order'),
      ])
      if (!project) { router.push('/proyectos'); return }
      setName(project.name)
      setDesc(project.description ?? '')
      setType(project.type)
      setStatus(project.status)
      setCurrency(project.currency)
      setBudget(project.budget ? String(project.budget) : '')
      setUrl(project.url ?? '')
      setStartDate(project.start_date ?? '')
      setEndDate(project.end_date ?? '')
      setProgress(project.progress)
      setMilestones((ms ?? []).map(m => ({
        id: m.id, title: m.title, status: m.status, due_date: m.due_date ?? '',
      })))
      setLoading(false)
    }
    load()
  }, [id])

  function updateMilestone(i: number, field: keyof Milestone, value: string) {
    setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Update project
    const { error: projErr } = await supabase
      .from('projects')
      .update({
        name, description: description || null, type, status, currency,
        budget: budget ? parseFloat(budget) : null,
        url: url || null, start_date: startDate || null,
        end_date: endDate || null, progress,
      })
      .eq('id', id)

    if (projErr) { setError(projErr.message); setSaving(false); return }

    // Handle milestones: upsert existing, insert new, delete marked
    const toDelete = milestones.filter(m => m.id && m._delete).map(m => m.id!)
    const toUpsert = milestones.filter(m => !m._delete && m.title.trim())

    if (toDelete.length) {
      await supabase.from('milestones').delete().in('id', toDelete)
    }

    for (let i = 0; i < toUpsert.length; i++) {
      const m = toUpsert[i]
      if (m.id) {
        await supabase.from('milestones').update({
          title: m.title, status: m.status,
          due_date: m.due_date || null, sort_order: i,
        }).eq('id', m.id)
      } else {
        await supabase.from('milestones').insert({
          project_id: id, title: m.title, status: m.status,
          due_date: m.due_date || null, sort_order: i,
        })
      }
    }

    router.push(`/proyectos/${id}`)
  }

  if (loading) return (
    <>
      <Topbar title="Editar proyecto" />
      <main className="p-6 flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    </>
  )

  return (
    <>
      <Topbar title="Editar proyecto" />
      <main className="p-4 sm:p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href={`/proyectos/${id}`}><ArrowLeft className="h-4 w-4" />Volver al proyecto</Link>
        </Button>

        <form onSubmit={handleSave} className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Datos del proyecto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nombre *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <select value={type} onChange={e => setType(e.target.value)} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Progreso: {progress}%</Label>
                  <input type="range" min="0" max="100" value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full accent-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label>Moneda</Label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                    <option value="USD">USD</option><option value="UYU">UYU</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Presupuesto</Label>
                  <Input type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL del proyecto</Label>
                  <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de inicio</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de entrega est.</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
                  placeholder="Descripción, alcance, objetivos..." />
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card id="milestones">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hitos</CardTitle>
                <Button type="button" variant="outline" size="sm" className="gap-1.5"
                  onClick={() => setMilestones(p => [...p, { title: '', status: 'pending', due_date: '' }])}>
                  <Plus className="h-3.5 w-3.5" />Agregar hito
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {milestones.filter(m => !m._delete).length === 0 && (
                <p className="text-sm text-muted-foreground py-2 text-center">Sin hitos. Agregá el primero.</p>
              )}
              {milestones.map((m, i) => m._delete ? null : (
                <div key={i} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                    <Input
                      value={m.title}
                      onChange={e => updateMilestone(i, 'title', e.target.value)}
                      placeholder="Título del hito"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" className="flex-shrink-0 px-2 h-9"
                      onClick={() => setMilestones(p => p.map((x, idx) => idx === i ? { ...x, _delete: true } : x))}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <select
                      value={m.status}
                      onChange={e => updateMilestone(i, 'status', e.target.value)}
                      className="h-8 rounded-md border bg-card px-2 text-xs flex-1"
                    >
                      {Object.entries(MILESTONE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <Input
                      type="date" value={m.due_date}
                      onChange={e => updateMilestone(i, 'due_date', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>}

          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </main>
    </>
  )
}
