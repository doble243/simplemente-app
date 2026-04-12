import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateTax } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { ExternalLink, Download } from 'lucide-react'
import type { CurrencyType } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

export default async function PortalInvoicePage({ params }: Props) {
  const { id } = await params
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')
  if (isDemo) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
        <p className="text-sm text-muted-foreground">Conectá Supabase para ver el detalle de la factura.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase.from('clients').select('id').eq('profile_id', user.id).single()
  if (!client) redirect('/portal')

  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', id).eq('client_id', client.id).single(),
    supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sort_order'),
  ])

  if (!invoice) notFound()

  const currency = invoice.currency as CurrencyType

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground text-sm">Emitida el {formatDate(invoice.issued_date)}</p>
        </div>
        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'outline'} className="text-sm">
          {invoice.status === 'paid' ? 'Pagada' :
           invoice.status === 'overdue' ? 'Vencida' :
           invoice.status === 'sent' ? 'Pendiente' : invoice.status}
        </Badge>
      </div>

      {/* Line items */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-accent border-b text-xs text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-right">Cant.</th>
              <th className="px-4 py-3 text-right">Precio unit.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatCurrency(item.unit_price, currency)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {formatCurrency(item.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="bg-accent border-t px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          {invoice.tax_rate > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(invoice.tax_amount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground text-base border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(invoice.total, currency)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notas</p>
          <p className="text-sm text-foreground">{invoice.notes}</p>
        </div>
      )}

      {/* Actions */}
      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
        <div className="flex gap-3">
          {invoice.payment_link && (
            <Button asChild className="gap-2 flex-1">
              <a href={invoice.payment_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Pagar con MercadoPago
              </a>
            </Button>
          )}
          {invoice.pdf_url && (
            <Button asChild variant="outline" className="gap-2">
              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                PDF
              </a>
            </Button>
          )}
        </div>
      )}

      {invoice.status === 'paid' && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-700 font-medium">
            ✓ Factura pagada el {invoice.paid_at ? formatDate(invoice.paid_at) : ''}
          </p>
        </div>
      )}
    </div>
  )
}
