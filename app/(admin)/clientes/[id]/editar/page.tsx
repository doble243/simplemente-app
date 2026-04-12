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
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditarClientePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [rut, setRut]                 = useState('')
  const [address, setAddress]         = useState('')
  const [city, setCity]               = useState('')
  const [status, setStatus]           = useState('active')
  const [notes, setNotes]             = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { router.push('/clientes'); return }
      setCompanyName(data.company_name)
      setEmail(data.email)
      setPhone(data.phone ?? '')
      setRut(data.rut ?? '')
      setAddress(data.address ?? '')
      setCity(data.city ?? '')
      setStatus(data.status)
      setNotes(data.notes ?? '')
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName || !email) { setError('Empresa y email son requeridos'); return }
    setSaving(true)
    setError(null)

    const { error: err } = await supabase
      .from('clients')
      .update({
        company_name: companyName,
        email,
        phone: phone || null,
        rut: rut || null,
        address: address || null,
        city: city || null,
        status,
        notes: notes || null,
      })
      .eq('id', id)

    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/clientes/${id}`)
  }

  if (loading) return (
    <>
      <Topbar title="Editar cliente" />
      <main className="p-4 flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    </>
  )

  return (
    <>
      <Topbar title="Editar cliente" />
      <main className="p-4 sm:p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href={`/clientes/${id}`}><ArrowLeft className="h-4 w-4" />Volver al cliente</Link>
        </Button>

        <Card>
          <CardHeader><CardTitle className="text-base">Datos del cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Empresa *</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nombre de la empresa" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contacto@empresa.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09X XXX XXX" />
                </div>
                <div className="space-y-1.5">
                  <Label>RUT</Label>
                  <Input value={rut} onChange={e => setRut(e.target.value)} placeholder="21.000.000-0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Ciudad</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Montevideo" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Dirección</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle 123, Montevideo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="prospect">Prospecto</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notas internas</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notas sobre el cliente..." />
              </div>

              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1 gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/clientes/${id}`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
