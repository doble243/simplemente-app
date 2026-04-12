'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, XCircle, Loader2, AlertTriangle } from 'lucide-react'

interface Props {
  invoiceId: string
  status: string
  projectId: string | null
}

const CANCELLABLE = ['draft', 'sent', 'viewed', 'overdue']
const DELETABLE = ['draft', 'cancelled']

export function InvoiceActions({ invoiceId, status, projectId }: Props) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCancel = CANCELLABLE.includes(status)
  const canDelete = DELETABLE.includes(status)

  if (!canCancel && !canDelete) return null

  async function handleCancel() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) throw new Error('Error al cancelar la factura')
      router.refresh()
      setConfirmAction(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al eliminar la factura')
      // Redirect: back to project if linked, otherwise facturas list
      router.push(projectId ? `/proyectos/${projectId}` : '/facturas')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setLoading(false)
    }
  }

  // ── Confirm dialog ──
  if (confirmAction) {
    const isDelete = confirmAction === 'delete'
    return (
      <div className="card-base p-4 border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              {isDelete ? '¿Eliminar esta factura?' : '¿Cancelar esta factura?'}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {isDelete
                ? 'Esta acción es permanente y no se puede deshacer.'
                : 'Se marcará como cancelada. Podés eliminarla después.'}
            </p>
            {error && (
              <p className="mt-2 text-[12px] text-destructive">{error}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={isDelete ? handleDelete : handleCancel}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-[12px] font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDelete ? 'Sí, eliminar' : 'Sí, cancelar'}
          </button>
          <button
            onClick={() => { setConfirmAction(null); setError(null) }}
            disabled={loading}
            className="rounded-lg border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-accent/60 transition-colors disabled:opacity-60"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // ── Action buttons ──
  return (
    <div className="card-base p-4 space-y-3">
      <p className="heading-card">Acciones</p>
      <div className="flex flex-wrap gap-2">
        {canCancel && status !== 'cancelled' && (
          <button
            onClick={() => setConfirmAction('cancel')}
            className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800/40 dark:bg-orange-950/20 px-3 py-2 text-[12px] font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancelar factura
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setConfirmAction('delete')}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20 px-3 py-2 text-[12px] font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar factura
          </button>
        )}
      </div>
    </div>
  )
}
