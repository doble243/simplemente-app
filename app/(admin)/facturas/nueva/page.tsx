'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, FolderKanban } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

interface Client {
  id: string
  company_name: string
}

const TAX_RATE_UYU = 22

function calcTotals(items: LineItem[], currency: CurrencyType) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const taxRate = currency === 'UYU' ? TAX_RATE_UYU : 0
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  return { subtotal, taxRate, taxAmount, total }
}

function todayStr() { return new Date().toISOString().split('T')[0] }
function dueDateStr(days = 30) {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
function invoiceNumber() {
  const now = new Date()
  return `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`
}

export default function NuevaFacturaPage() {
  const router = useRouter()
  const params = useSearchParams()

  // Pre-fill from project context
  const preProjectId   = params.get('projectId') ?? ''
  const preClientId    = params.get('clientId') ?? ''
  const preProjectName = params.get('projectName') ?? ''

  const supabase = createClient()
  const [clients, setClients]   = useState<Client[]>([])
  const [clientId, setClientId] = useState(preClientId)
  const [currency, setCurrency] = useState<CurrencyType>('USD')
  const [items, setItems]       = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [notes, setNotes]       = useState('')
  const [issuedDate, setIssuedDate] = useState(todayStr())
  const [dueDate, setDueDate]       = useState(dueDateStr())
  const [saving, setSaving]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState(preProjectName)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    supabase.from('clients').select('id, company_name').eq('status', 'active').order('company_name')
      .then(({ data }) => setClients(data ?? []))
  }, [])

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ))
  }

  async function generateWithAI() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: 'web_landing',
          description: aiPrompt,
          requirements: [],
          currency,
        }),
      })
      if (!res.ok) throw new Error('Error al generar presupuesto')
      const data = await res.json()
      if (data.items?.length) {
        setItems(data.items.map((item: { description: string; quantity: number; unit_price: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })))
        if (data.notes) setNotes(data.notes)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar presupuesto')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) { setError('Seleccioná un cliente'); return }
    setSaving(true)
    setError(null)

    const { subtotal, taxRate, taxAmount, total } = calcTotals(items, currency)

    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .insert({
        client_id:      clientId,
        project_id:     preProjectId || null,
        invoice_number: invoiceNumber(),
        status:         'draft',
        currency,
        subtotal,
        tax_rate:   taxRate,
        tax_amount: taxAmount,
        total,
        notes:      notes || null,
        issued_date: issuedDate,
        due_date:    dueDate,
      })
      .select()
      .single()

    if (invErr) { setError(invErr.message); setSaving(false); return }

    if (items.some(i => i.description.trim())) {
      await supabase.from('invoice_items').insert(
        items
          .filter(i => i.description.trim())
          .map((item, idx) => ({
            invoice_id:   invoice.id,
            description:  item.description,
            quantity:     item.quantity,
            unit_price:   item.unit_price,
            amount:       item.quantity * item.unit_price,
            sort_order:   idx,
          }))
      )
    }

    // Go back to project if we came from one, otherwise go to invoice
    if (preProjectId) {
      router.push(`/proyectos/${preProjectId}`)
    } else {
      router.push(`/facturas/${invoice.id}`)
    }
  }

  const { subtotal, taxRate, taxAmount, total } = calcTotals(items, currency)
  const backHref = preProjectId ? `/proyectos/${preProjectId}` : '/facturas'
  const backLabel = preProjectId ? 'Volver al proyecto' : 'Facturas'

  return (
    <>
      <Topbar title="Nueva factura" />
      <main className="p-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href={backHref}><ArrowLeft className="h-4 w-4" />{backLabel}</Link>
        </Button>

        {/* Project context banner */}
        {preProjectName && (
          <div className="flex items-center gap-2 mb-4 rounded-lg bg-primary/8 border border-primary/20 px-4 py-2.5 text-sm">
            <FolderKanban className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-foreground">Factura para proyecto: <strong>{preProjectName}</strong></span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header fields */}
          <Card>
            <CardHeader><CardTitle>Datos de la factura</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Cliente *</Label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Seleccioná un cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Moneda</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                    className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="UYU">UYU (+ IVA 22%)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de emisión</Label>
                  <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de vencimiento</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI quote generator */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-base">Generar ítems con IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Landing page + diseño UX/UI para empresa de servicios"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); generateWithAI() } }}
                />
                <Button
                  type="button" variant="outline"
                  onClick={generateWithAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="gap-2 flex-shrink-0"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-500" />}
                  Generar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                La IA generará líneas de factura con precios de mercado uruguayo.
                {preProjectName && ' El nombre del proyecto ya está cargado.'}
              </p>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ítems</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => setItems(p => [...p, { description: '', quantity: 1, unit_price: 0 }])} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />Agregar ítem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="hidden sm:grid grid-cols-[1fr_56px_112px_80px_36px] gap-2 text-xs text-muted-foreground px-1">
                <span>Descripción</span><span className="text-center">Cant.</span>
                <span>Precio unit.</span><span className="text-right">Total</span><span />
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    placeholder="Descripción del servicio"
                    className="flex-1"
                  />
                  <Input
                    type="number" min="1" value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    className="w-14 text-center"
                  />
                  <Input
                    type="number" min="0" step="0.01" value={item.unit_price}
                    onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
                    placeholder="0.00"
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground py-2 w-20 text-right flex-shrink-0 tabular-nums">
                    {formatCurrency(item.quantity * item.unit_price, currency)}
                  </span>
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}
                    disabled={items.length === 1}
                    className="flex-shrink-0 px-2"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t pt-3 space-y-1.5 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>IVA ({taxRate}%)</span>
                    <span className="tabular-nums">{formatCurrency(taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground text-base border-t pt-1.5">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notas (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Condiciones de pago, términos adicionales..." />
          </div>

          {error && <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>}

          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Crear factura en borrador'}
          </Button>
        </form>
      </main>
    </>
  )
}
