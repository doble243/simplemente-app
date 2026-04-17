'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const schema = z.object({
  company_name: z.string().min(1, 'Requerido'),
  email:        z.string().email('Email inválido'),
  phone:        z.string().optional(),
  rut:          z.string().optional(),
  address:      z.string().optional(),
  city:         z.string().optional(),
  notes:        z.string().optional(),
  status:       z.enum(['active', 'inactive', 'prospect']),
})

type FormData = z.infer<typeof schema>

export default function NuevoClientePage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  // Pre-fill from lead params
  const fromLead     = params.get('lead') ?? ''
  const preName      = params.get('name') ?? ''
  const preEmail     = params.get('email') ?? ''
  const prePhone     = params.get('phone') ?? ''
  const preCompany   = params.get('company') ?? ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status:       'active',
      company_name: preCompany || preName,   // use company if set, else name
      email:        preEmail,
      phone:        prePhone,
    },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { data: client, error: err } = await supabase
      .from('clients')
      .insert({ ...data, country: 'Uruguay' })
      .select()
      .single()

    if (err) { setError(err.message); return }

    // Mark lead as won if converted
    if (fromLead) {
      await supabase.from('leads').update({ status: 'won', converted_to: client.id }).eq('id', fromLead)
    }

    router.push(`/clientes/${client.id}`)
  }

  return (
    <>
      <Topbar title="Nuevo cliente" />
      <main className="page-shell">
        <div className="max-w-2xl">

          <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2 text-muted-foreground h-8">
            <Link href={fromLead ? `/leads/${fromLead}` : '/clientes'}>
              <ArrowLeft className="h-3.5 w-3.5" />{fromLead ? 'Volver al lead' : 'Clientes'}
            </Link>
          </Button>

          {/* From-lead banner */}
          {fromLead && (
            <div className="flex items-center gap-2 mb-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-2.5 text-sm">
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-foreground">
                Convirtiendo lead <strong>{preName}</strong> en cliente — datos pre-cargados
              </span>
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Datos del cliente</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Empresa *</Label>
                    <Input {...register('company_name')} placeholder="Nombre de la empresa" autoFocus />
                    {errors.company_name && <p className="text-xs text-destructive">{errors.company_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input {...register('email')} type="email" placeholder="contacto@empresa.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Teléfono</Label>
                    <Input {...register('phone')} placeholder="09X XXX XXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>RUT</Label>
                    <Input {...register('rut')} placeholder="21.000.000-0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ciudad</Label>
                    <Input {...register('city')} placeholder="Montevideo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <select {...register('status')} className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm">
                      <option value="active">Activo</option>
                      <option value="prospect">Prospecto</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Dirección</Label>
                  <Input {...register('address')} placeholder="Calle 123, Montevideo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Notas internas</Label>
                  <Textarea {...register('notes')} rows={3} placeholder="Notas sobre el cliente..." />
                </div>

                {error && <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>}

                <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                  {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                  {fromLead ? 'Crear cliente y marcar lead como ganado' : 'Crear cliente'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
