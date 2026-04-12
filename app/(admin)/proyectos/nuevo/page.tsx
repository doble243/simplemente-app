'use client'

import { useRouter } from 'next/navigation'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  web_landing:  'Landing page',
  web_app:      'Aplicación web',
  ecommerce:    'E-commerce',
  branding:     'Branding',
  seo:          'SEO',
  maintenance:  'Mantenimiento',
}

const STATUS_LABELS: Record<string, string> = {
  lead:       'Lead',
  proposal:   'Propuesta',
  active:     'Activo',
  review:     'Revisión',
  completed:  'Completado',
  paused:     'Pausado',
  cancelled:  'Cancelado',
}

export default function NuevoProyectoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([])

  useEffect(() => {
    supabase
      .from('clients')
      .select('id, company_name')
      .eq('status', 'active')
      .order('company_name')
      .then(({ data }) => setClients(data ?? []))
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', type: 'web_landing', currency: 'USD' },
  })

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
    router.push(`/proyectos/${project.id}`)
  }

  return (
    <>
      <Topbar title="Nuevo proyecto" />
      <main className="p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href="/proyectos"><ArrowLeft className="h-4 w-4" />Proyectos</Link>
        </Button>

        <Card>
          <CardHeader><CardTitle>Datos del proyecto</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Cliente */}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nombre del proyecto *</Label>
                  <Input {...register('name')} placeholder="Ej: Rediseño web corporativo" />
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
                  <Input {...register('budget')} type="number" min="0" step="0.01" placeholder="0.00" />
                </div>

                {/* Moneda */}
                <div className="space-y-1.5">
                  <Label>Moneda</Label>
                  <select {...register('currency')} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                    <option value="USD">USD</option>
                    <option value="UYU">UYU</option>
                  </select>
                </div>

                {/* Fecha inicio */}
                <div className="space-y-1.5">
                  <Label>Fecha de inicio</Label>
                  <Input {...register('start_date')} type="date" />
                </div>

                {/* Fecha fin */}
                <div className="space-y-1.5">
                  <Label>Fecha de entrega estimada</Label>
                  <Input {...register('end_date')} type="date" />
                </div>

                {/* URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>URL del proyecto</Label>
                  <Input {...register('url')} type="url" placeholder="https://cliente.com" />
                  {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea {...register('description')} rows={3} placeholder="Descripción del proyecto, alcance, objetivos..." />
              </div>

              {error && <p className="text-sm text-red-500 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2">{error}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creando...' : 'Crear proyecto'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
