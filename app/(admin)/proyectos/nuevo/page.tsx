'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}
function plusDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  client_id:   z.string().min(1, 'Seleccioná un cliente'),
  name:        z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  type:        z.enum(['web_landing', 'web_app', 'ecommerce', 'branding', 'seo', 'maintenance']),
  status:      z.enum(['lead', 'proposal', 'active', 'review', 'completed', 'paused', 'cancelled']),
  currency:    z.enum(['UYU', 'USD']),
  budget:      z.string().optional(),
  url:         z.string().optional(),
  start_date:  z.string().optional(),
  end_date:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_LABELS: Record<string, string> = {
  web_landing: 'Landing page',
  web_app:     'Aplicación web',
  ecommerce:   'E-commerce',
  branding:    'Branding',
  seo:         'SEO',
  maintenance: 'Mantenimiento',
}
const STATUS_LABELS: Record<string, string> = {
  lead:      'Lead',
  proposal:  'Propuesta',
  active:    'Activo',
  review:    'Revisión',
  completed: 'Completado',
  paused:    'Pausado',
  cancelled: 'Cancelado',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NuevoProyectoPage() {
  const router     = useRouter()
  const params     = useSearchParams()
  const supabase   = createClient()

  // Query params
  const preClientId   = params.get('client')   ?? ''
  const preClientName = params.get('clientName') ?? ''

  const [error, setError]     = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id:  preClientId,
      status:     'active',
      type:       'web_landing',
      currency:   'UYU',
      start_date: todayISO(),
      end_date:   plusDaysISO(7),
    },
  })

  // Track if user manually edited end_date
  const [endDateTouched, setEndDateTouched] = useState(false)
  const startDate = watch('start_date')

  useEffect(() => {
    // Only auto-update end_date if the user hasn't manually changed it
    if (startDate && !endDateTouched) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + 7)
      setValue('end_date', d.toISOString().split('T')[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate])

  useEffect(() => {
    // Load all clients for the dropdown
    supabase
      .from('clients')
      .select('id, company_name')
      .eq('status', 'active')
      .order('company_name')
      .then(({ data }) => setClients(data ?? []))

    // If coming from a client, fetch their most recent project URL
    if (preClientId) {
      supabase
        .from('projects')
        .select('url')
        .eq('client_id', preClientId)
        .not('url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          const url = data?.[0]?.url
          if (url) setValue('url', url)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(data: FormData) {
    setError(null)
    const { data: project, error: err } = await supabase
      .from('projects')
      .insert({
        client_id:   data.client_id,
        name:        data.name,
        description: data.description || null,
        type:        data.type,
        status:      data.status,
        currency:    data.currency,
        budget:      data.budget ? parseFloat(data.budget) : null,
        url:         data.url || null,
        start_date:  data.start_date || null,
        end_date:    data.end_date || null,
      })
      .select()
      .single()

    if (err) { setError(err.message); return }

    // Go back to client if we came from one, otherwise go to the project
    if (preClientId) {
      router.push(`/clientes/${preClientId}`)
    } else {
      router.push(`/proyectos/${project.id}`)
    }
  }

  const backHref  = preClientId ? `/clientes/${preClientId}` : '/proyectos'
  const backLabel = preClientName ? preClientName : 'Proyectos'

  return (
    <>
      <Topbar title="Nuevo proyecto" />
      <main className="page-shell">
        <div className="max-w-2xl">

          <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2 text-muted-foreground h-8">
            <Link href={backHref}><ArrowLeft className="h-3.5 w-3.5" />{backLabel}</Link>
          </Button>

          {/* Client context banner */}
          {preClientName && (
            <div className="flex items-center gap-2 mb-4 rounded-lg bg-primary/8 border border-primary/20 px-4 py-2.5 text-sm">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">
                Nuevo proyecto para <strong>{preClientName}</strong>
              </span>
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Datos del proyecto</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Cliente — hidden if pre-filled, visible otherwise */}
                {preClientId ? (
                  <input type="hidden" {...register('client_id')} />
                ) : (
                  <div className="space-y-1.5">
                    <Label>Cliente *</Label>
                    <select
                      {...register('client_id')}
                      className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">Seleccioná un cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.company_name}</option>
                      ))}
                    </select>
                    {errors.client_id && <p className="text-xs text-red-500">{errors.client_id.message}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Nombre */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Nombre del proyecto *</Label>
                    <Input {...register('name')} placeholder="Ej: Rediseño web corporativo" autoFocus={!!preClientId} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Tipo */}
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <select {...register('type')} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                      {Object.entries(TYPE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estado */}
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <select {...register('status')} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Presupuesto */}
                  <div className="space-y-1.5">
                    <Label>Presupuesto</Label>
                    <Input {...register('budget')} type="number" min="0" step="1" placeholder="0" />
                  </div>

                  {/* Moneda */}
                  <div className="space-y-1.5">
                    <Label>Moneda</Label>
                    <select {...register('currency')} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                      <option value="UYU">UYU (pesos)</option>
                      <option value="USD">USD (dólares)</option>
                    </select>
                  </div>

                  {/* Fecha inicio */}
                  <div className="space-y-1.5">
                    <Label>Fecha de inicio</Label>
                    <Input {...register('start_date')} type="date" />
                  </div>

                  {/* Fecha entrega — 7 días después de inicio por defecto */}
                  <div className="space-y-1.5">
                    <Label>
                      Fecha de entrega estimada
                      <span className="ml-1.5 text-[11px] text-muted-foreground font-normal">(inicio +7 días)</span>
                    </Label>
                    <Input
                      {...register('end_date')}
                      type="date"
                      onChange={(e) => {
                        setEndDateTouched(true)
                        register('end_date').onChange(e)
                      }}
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>
                      URL del proyecto
                      {preClientId && (
                        <span className="ml-1.5 text-[11px] text-muted-foreground font-normal">
                          (autocompletada desde proyectos anteriores)
                        </span>
                      )}
                    </Label>
                    <Input {...register('url')} type="url" placeholder="https://cliente.com" />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <Label>Descripción</Label>
                  <Textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Descripción del proyecto, alcance, objetivos..."
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creando...' : 'Crear proyecto'}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}
