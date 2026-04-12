import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/Topbar'
import { InvoiceUpsellButton } from '@/components/admin/InvoiceUpsellButton'
import { InvoiceShareButtons } from '@/components/admin/InvoiceShareButtons'
import { InvoiceActions } from '@/components/admin/InvoiceActions'
import { ArrowLeft, FolderKanban, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import type { CurrencyType, InvoiceStatus } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Borrador',  cls: 'badge-muted' },
  sent:      { label: 'Enviada',   cls: 'badge-blue' },
  viewed:    { label: 'Vista',     cls: 'badge-purple' },
  paid:      { label: 'Pagada',    cls: 'badge-green' },
  overdue:   { label: 'Vencida',   cls: 'badge-red' },
  cancelled: { label: 'Cancelada', cls: 'badge-muted' },
}

const NEXT_STATUS: Record<string, string> = {
  draft: 'sent', sent: 'paid', viewed: 'paid',
}
const NEXT_LABEL: Record<string, string> = {
  sent: 'Marcar enviada', paid: 'Marcar pagada',
}

export default async function FacturaDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase.from('invoices')
      .select('*, clients(id, company_name, email, phone), projects(id, name, url, type)')
      .eq('id', id).single(),
    supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sort_order'),
  ])

  if (!invoice) notFound()

  const currency = invoice.currency as CurrencyType
  const st = STATUS_STYLE[invoice.status] ?? STATUS_STYLE.draft
  const client = invoice.clients as { id: string; company_name: string; email: string; phone: string | null } | null
  const project = invoice.projects as { id: string; name: string; url: string | null; type: string } | null
  const isDraft = invoice.status === 'draft'
  const nextStatus = NEXT_STATUS[invoice.status]
  const projectId = (project?.id) ?? null

  return (
    <>
      <Topbar title={invoice.invoice_number} />
      <main className="page-shell">
        <div className="page-narrow section-gap">

          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={project ? `/proyectos/${project.id}` : '/facturas'}
              className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors -ml-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {project ? 'Volver al proyecto' : 'Facturas'}
            </Link>
          </div>

          {/* Header card */}
          <div className="card-elevated p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="heading-page">{invoice.invoice_number}</h1>
                {client && (
                  <Link href={`/clientes/${client.id}`} className="link-primary text-sm block mt-0.5">
                    {client.company_name}
                  </Link>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                {st.label}
              </span>
            </div>

            {/* Project link */}
            {project && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <FolderKanban className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Link href={`/proyectos/${project.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors truncate">
                  {project.name}
                </Link>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="card-stat">
                <p className="label-xs mb-1">Emitida</p>
                <p className="text-[13px] font-semibold">{formatDate(invoice.issued_date)}</p>
              </div>
              {invoice.due_date && (
                <div className="card-stat">
                  <p className="label-xs mb-1">Vence</p>
                  <p className={`text-[13px] font-semibold ${
                    invoice.status === 'overdue' ? 'text-[var(--badge-danger-text)]' : ''
                  }`}>{formatDate(invoice.due_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line items — mobile-friendly rows */}
          <div className="card-base overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60">
              <h2 className="heading-card">Ítems</h2>
            </div>

            {/* Mobile: stacked rows */}
            <div className="divide-y divide-border/60">
              {(items ?? []).map(item => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-medium text-foreground leading-snug flex-1">{item.description}</p>
                    <p className="shrink-0 text-[13px] font-bold text-foreground tabular-nums">
                      {formatCurrency(item.amount, currency)}
                    </p>
                  </div>
                  {(item.quantity > 1 || item.unit_price !== item.amount) && (
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {item.quantity} × {formatCurrency(item.unit_price, currency)}
                    </p>
                  )}
                </div>
              ))}
              {(items ?? []).length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">Sin ítems.</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border/60 bg-muted/30 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-[13px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-[13px] text-muted-foreground">
                  <span>IVA ({invoice.tax_rate}%)</span>
                  <span className="tabular-nums">{formatCurrency(invoice.tax_amount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-base font-bold text-foreground tabular-nums">{formatCurrency(invoice.total, currency)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="card-base p-4">
              <p className="label-xs mb-1.5">Notas</p>
              <p className="text-[13px] text-foreground leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Status action */}
          {nextStatus && (
            <div className="card-base p-4 flex items-center justify-between gap-3">
              <p className="text-[13px] text-muted-foreground">
                Avanzar a: <span className="font-semibold text-foreground">{STATUS_STYLE[nextStatus]?.label}</span>
              </p>
              <form action={`/api/invoices/${id}/status`} method="POST">
                <input type="hidden" name="status" value={nextStatus} />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {NEXT_LABEL[nextStatus] ?? `Marcar ${STATUS_STYLE[nextStatus]?.label}`}
                </button>
              </form>
            </div>
          )}

          {invoice.status === 'paid' && invoice.paid_at && (
            <div className="rounded-xl border bg-[var(--badge-success-bg)] px-4 py-3 text-center">
              <p className="text-[13px] font-semibold text-[var(--badge-success-text)]">
                ✓ Pagada el {formatDate(invoice.paid_at)}
              </p>
            </div>
          )}

          {/* Share buttons — email + WhatsApp + PDF */}
          <InvoiceShareButtons
            invoiceNumber={invoice.invoice_number}
            clientEmail={client?.email ?? null}
            clientPhone={client?.phone ?? null}
            clientName={client?.company_name ?? 'Cliente'}
            total={invoice.total}
            currency={currency}
            invoiceId={id}
          />

          {/* AI Upsell — only for draft invoices */}
          {isDraft && (
            <InvoiceUpsellButton
              invoiceId={id}
              currency={currency}
              isDraft={isDraft}
            />
          )}

          {/* Delete / Cancel */}
          <InvoiceActions
            invoiceId={id}
            status={invoice.status}
            projectId={projectId}
          />

        </div>
      </main>
    </>
  )
}
