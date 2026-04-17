'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
      <main className="page-shell">
        <div className="max-w-2xl space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">

              {/* Datos de la agencia */}
              <div className="card-elevated p-5">
                <p className="heading-card mb-4">Datos de la agencia</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {([
                    { key: 'agency_name', label: 'Nombre',     type: 'text',  placeholder: 'Simplemente'          },
                    { key: 'email',       label: 'Email',      type: 'email', placeholder: 'hola@simplemente.uy'  },
                    { key: 'phone',       label: 'Teléfono',   type: 'text',  placeholder: '09X XXX XXX'           },
                    { key: 'rut',         label: 'RUT',        type: 'text',  placeholder: '21.000.000-0'          },
                    { key: 'website',     label: 'Sitio web',  type: 'url',   placeholder: 'https://simplemente.uy'},
                    { key: 'address',     label: 'Dirección',  type: 'text',  placeholder: 'Montevideo, Uruguay'   },
                  ] as Array<{ key: keyof FormState; label: string; type: string; placeholder: string }>
                  ).map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="label-admin">{label}</label>
                      <Input
                        type={type}
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        placeholder={placeholder}
                        className="text-[13px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Facturación */}
              <div className="card-elevated p-5">
                <p className="heading-card mb-4">Facturación</p>
                <div className="space-y-4">
                  <div>
                    <label className="label-admin">Condiciones de pago</label>
                    <Input
                      value={form.payment_terms}
                      onChange={e => set('payment_terms', e.target.value)}
                      className="text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="label-admin">Pie de página en facturas</label>
                    <Textarea
                      value={form.invoice_footer}
                      onChange={e => set('invoice_footer', e.target.value)}
                      rows={3}
                      className="text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/[0.07] px-4 py-3 text-[13px] text-destructive">
                  {error}
                </p>
              )}

              {saved && (
                <p className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 text-[13px] text-[var(--badge-success-text)]">
                  <Check className="h-4 w-4" />
                  Cambios guardados correctamente.
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving} className="gap-2 h-9 px-5 text-[13px]">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>

            </form>
          )}
        </div>
      </main>
    </>
  )
}
