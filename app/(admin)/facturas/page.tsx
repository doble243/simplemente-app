import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import type { CurrencyType } from '@/types/database'

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Borrador',  cls: 'badge-muted' },
  sent:      { label: 'Enviada',   cls: 'badge-blue' },
  viewed:    { label: 'Vista',     cls: 'badge-purple' },
  paid:      { label: 'Pagada',    cls: 'badge-green' },
  overdue:   { label: 'Vencida',   cls: 'badge-red' },
  cancelled: { label: 'Cancelada', cls: 'badge-muted' },
}

export default async function FacturasPage() {
  const supabase = await createClient()
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, currency, issued_date, due_date, clients(company_name)')
    .order('created_at', { ascending: false })

  const list = invoices ?? []

  const newBtn = (
    <Link
      href="/facturas/nueva"
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-8 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />Nueva
    </Link>
  )

  return (
    <>
      <Topbar title="Facturas" actions={newBtn} />
      <main className="page-shell">

        <p className="text-[12px] text-muted-foreground mb-3">{list.length} facturas</p>

        {/* Mobile: cards */}
        <div className="space-y-2 md:hidden">
          {list.map(inv => {
            const st = STATUS_STYLE[inv.status] ?? STATUS_STYLE.draft
            const client = (inv.clients as unknown as { company_name: string } | null)
            return (
              <Link key={inv.id} href={`/facturas/${inv.id}`}
                className="card-base flex items-center gap-3 p-3.5 interactive">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-foreground">{inv.invoice_number}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  {client && (
                    <p className="text-[12px] text-muted-foreground truncate mt-0.5">{client.company_name}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[12px] text-muted-foreground">{formatDate(inv.issued_date)}</p>
                    <p className="text-[13px] font-semibold text-foreground tabular-nums">
                      {formatCurrency(inv.total, inv.currency as CurrencyType)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
          {list.length === 0 && (
            <div className="card-base py-10 text-center">
              <p className="text-sm text-muted-foreground">Sin facturas todavía.</p>
              <Link href="/facturas/nueva" className="mt-2 inline-block text-sm link-primary">Creá la primera →</Link>
            </div>
          )}
        </div>

        {/* Desktop: refined table */}
        <div className="hidden md:block card-base overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left">
                <th className="px-4 py-3 label-xs">Número</th>
                <th className="px-4 py-3 label-xs">Cliente</th>
                <th className="px-4 py-3 label-xs">Total</th>
                <th className="px-4 py-3 label-xs">Estado</th>
                <th className="px-4 py-3 label-xs hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 label-xs hidden lg:table-cell">Vence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {list.map(inv => {
                const st = STATUS_STYLE[inv.status] ?? STATUS_STYLE.draft
                const client = (inv.clients as unknown as { company_name: string } | null)
                return (
                  <tr key={inv.id} className="interactive cursor-pointer hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/facturas/${inv.id}`}
                        className="text-[13px] font-bold text-foreground hover:text-primary transition-colors">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">
                      {client?.company_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold text-foreground tabular-nums">
                        {formatCurrency(inv.total, inv.currency as CurrencyType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[12px] text-muted-foreground">
                      {formatDate(inv.issued_date)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[12px] text-muted-foreground">
                      {inv.due_date ? formatDate(inv.due_date) : '—'}
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                    Sin facturas todavía.{' '}
                    <Link href="/facturas/nueva" className="link-primary">Creá la primera</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </>
  )
}
