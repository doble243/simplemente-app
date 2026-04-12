'use client'

import { useRouter } from 'next/navigation'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const schema = z.object({
  company_name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  rut: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
})

type FormData = z.infer<typeof schema>

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { data: client, error: err } = await supabase
      .from('clients')
      .insert({ ...data, country: 'Uruguay' })
      .select()
      .single()

    if (err) { setError(err.message); return }
    router.push(`/clientes/${client.id}`)
  }

  return (
    <>
      <Topbar title="Nuevo cliente" />
      <main className="p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href="/clientes"><ArrowLeft className="h-4 w-4" />Volver</Link>
        </Button>

        <Card>
          <CardHeader><CardTitle>Datos del cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Empresa *</Label>
                  <Input {...register('company_name')} placeholder="Nombre de la empresa" />
                  {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input {...register('email')} type="email" placeholder="contacto@empresa.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
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

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Guardando...' : 'Crear cliente'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
