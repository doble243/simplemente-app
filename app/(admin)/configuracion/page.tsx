'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'

const DEFAULTS = {
  agency_name:    'Simplemente',
  email:          'hola@simplemente.uy',
  phone:          '',
  address:        'Montevideo, Uruguay',
  rut:            '',
  website:        'https://simplemente.uy',
  invoice_footer: 'Gracias por su confianza en Simplemente.',
  payment_terms:  'Pago a 30 días de la fecha de emisión.',
}

type FormState = typeof DEFAULTS

export default function ConfiguracionPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setForm({
            agency_name:    data.agency_name    ?? DEFAULTS.agency_name,
            email:          data.email          ?? DEFAULTS.email,
            phone:          data.phone          ?? '',
            address:        data.address        ?? DEFAULTS.address,
            rut:            data.rut            ?? '',
            website:        data.website        ?? DEFAULTS.website,
            invoice_footer: data.invoice_footer ?? DEFAULTS.invoice_footer,
            payment_terms:  data.payment_terms  ?? DEFAULTS.payment_terms,
          })
        }
      })
      .catch(() => { /* use defaults on error */ })
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? 'Error al guardar')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Verificá la conexión.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Topbar title="Configuración" />
      <main className="p-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Datos de la agencia</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nombre</Label>
                    <Input value={form.agency_name} onChange={(e) => set('agency_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Teléfono</Label>
                    <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="09X XXX XXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>RUT</Label>
                    <Input value={form.rut} onChange={(e) => set('rut', e.target.value)} placeholder="21.000.000-0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sitio web</Label>
                    <Input value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Dirección</Label>
                    <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Facturación</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Condiciones de pago</Label>
                  <Input value={form.payment_terms} onChange={(e) => set('payment_terms', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pie de página en facturas</Label>
                  <Textarea
                    value={form.invoice_footer}
                    onChange={(e) => set('invoice_footer', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" className="gap-2" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : null}
                {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </>
  )
}
