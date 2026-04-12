'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Plus, Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'

interface UpsellItem {
  description: string
  quantity: number
  unit_price: number
}

function ConfirmBar({ addedTotal, currency, count, onConfirm }: {
  addedTotal: number; currency: CurrencyType; count: number; onConfirm: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-purple-100/80 dark:bg-purple-900/30 px-3 py-2">
      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
        + {formatCurrency(addedTotal, currency)} al total
      </span>
      <button
        onClick={onConfirm}
        className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-purple-700 transition-colors"
      >
        <Plus className="h-3 w-3" />Agregar {count} ítem{count > 1 ? 's' : ''}
      </button>
    </div>
  )
}

interface Props {
  invoiceId: string
  currency: CurrencyType
  isDraft: boolean
}

export function InvoiceUpsellButton({ invoiceId, currency, isDraft }: Props) {
  type UpsellState = 'idle' | 'loading' | 'preview' | 'saving' | 'done' | 'error'
  const [state, setState] = useState<UpsellState>('idle')
  const [items, setItems] = useState<UpsellItem[]>([])
  const [rationale, setRationale] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [open, setOpen] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  async function generate() {
    if (state === 'preview') { setOpen(o => !o); return }
    setState('loading')
    try {
      const res = await fetch('/api/ai/invoice-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setItems(data.items ?? [])
      setRationale(data.rationale ?? '')
      setSelected(new Set(data.items.map((_: UpsellItem, i: number) => i)))
      setState('preview')
      setOpen(true)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error')
      setState('error')
    }
  }

  async function confirm() {
    const toAdd = items.filter((_, i) => selected.has(i))
    if (!toAdd.length) return
    setState('saving')
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/add-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toAdd }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setState('done')
      setTimeout(() => window.location.reload(), 800)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error')
      setState('error')
    }
  }

  function toggleItem(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const addedTotal = items
    .filter((_, i) => selected.has(i))
    .reduce((s, item) => s + item.quantity * item.unit_price, 0)

  if (!isDraft) return null

  return (
    <div className="rounded-xl border border-purple-200/70 bg-purple-50/60 dark:border-purple-800/30 dark:bg-purple-950/20">
      <button
        onClick={generate}
        disabled={state === 'loading' || state === 'saving' || state === 'done'}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 rounded-xl transition-colors disabled:opacity-60"
      >
        <span className="flex items-center gap-2">
          {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          {state === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          {state === 'done'   && <Check className="h-4 w-4 text-green-600" />}
          {(state === 'idle' || state === 'preview' || state === 'error') && <Sparkles className="h-4 w-4" />}
          {state === 'idle'    && 'Aumentar costo final con IA'}
          {state === 'loading' && 'Analizando proyecto...'}
          {state === 'preview' && 'Ítems sugeridos por IA'}
          {state === 'saving'  && 'Guardando...'}
          {state === 'done'    && '¡Ítems agregados!'}
          {state === 'error'   && 'Aumentar costo final con IA'}
        </span>
        {state === 'preview' && (open
          ? <ChevronUp className="h-4 w-4 shrink-0" />
          : <ChevronDown className="h-4 w-4 shrink-0" />)}
      </button>

      {state === 'error' && (
        <div className="flex items-center gap-2 px-4 pb-3 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{errorMsg}
        </div>
      )}

      {state === 'preview' && open && (
        <div className="border-t border-purple-200/60 dark:border-purple-800/30 px-4 pb-4 pt-3 space-y-3">
          {rationale && (
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80 leading-relaxed">{rationale}</p>
          )}

          <div className="space-y-2">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className={`w-full flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                  selected.has(i)
                    ? 'border-purple-400/60 bg-purple-100/60 dark:border-purple-600/40 dark:bg-purple-900/30'
                    : 'border-border/60 bg-card opacity-60'
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                  selected.has(i) ? 'border-purple-500 bg-purple-500' : 'border-muted-foreground/40'
                }`}>
                  {selected.has(i) && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground leading-snug">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity > 1 ? `${item.quantity} × ` : ''}{formatCurrency(item.unit_price, currency)}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-foreground tabular-nums">
                  {formatCurrency(item.quantity * item.unit_price, currency)}
                </span>
              </button>
            ))}
          </div>

          {selected.size > 0 && (
            <ConfirmBar
              addedTotal={addedTotal}
              currency={currency}
              count={selected.size}
              onConfirm={confirm}
            />
          )}

          <button
            onClick={() => { setState('idle'); setItems([]); }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            Regenerar
          </button>
        </div>
      )}
    </div>
  )
}
