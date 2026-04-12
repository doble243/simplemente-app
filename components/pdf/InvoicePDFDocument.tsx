import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

// ─── Types ───────────────────────────────────────────────────────────────────

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  invoice_number: string
  issued_date: string
  due_date: string | null
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  notes: string | null
  paid_at: string | null
}

interface ClientData {
  company_name: string
  email: string
  phone: string | null
}

interface ProjectData {
  name: string
}

export interface InvoicePDFProps {
  invoice: InvoiceData
  items: InvoiceItem[]
  client: ClientData | null
  project: ProjectData | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRAND = '#5B4FE8'

function fmtCurrency(amount: number, currency: string): string {
  if (currency === 'UYU') {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency', currency: 'UYU',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount)
}

function fmtDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  } catch {
    return dateStr
  }
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', viewed: 'Vista',
  paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a2e',
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  brandMark: {
    width: 36,
    height: 36,
    backgroundColor: BRAND,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1,
  },
  brandName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
    fontFamily: 'Helvetica-Bold',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 8,
    color: '#475569',
    fontFamily: 'Helvetica-Bold',
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  brandDivider: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    marginBottom: 20,
  },

  // Meta row (dates + bill-to)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 16,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  metaSubValue: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
  },
  billToName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 2,
  },

  // Items table
  table: {
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  descCol: { flex: 1 },
  qtyCol: { width: 36, textAlign: 'center' },
  priceCol: { width: 72, textAlign: 'right' },
  totalCol: { width: 72, textAlign: 'right' },

  // Totals
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 9,
    color: '#334155',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: BRAND,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'right',
  },

  // Notes
  notesSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  footerBrand: {
    fontSize: 7,
    color: BRAND,
    fontFamily: 'Helvetica-Bold',
  },
})

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoicePDFDocument({ invoice, items, client, project }: InvoicePDFProps) {
  const curr = invoice.currency
  const statusLabel = STATUS_LABEL[invoice.status] ?? invoice.status

  return (
    <Document
      title={`Factura ${invoice.invoice_number}`}
      author="Simplemente"
      subject={`Factura ${invoice.invoice_number}`}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <View style={s.brandMark}>
              <Text style={s.brandLetter}>S</Text>
            </View>
            <Text style={s.brandName}>Simplemente</Text>
            <Text style={s.brandTagline}>Agencia Digital · Uruguay</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.invoiceTitle}>FACTURA</Text>
            <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={s.statusBadge}>
              <Text style={s.statusText}>{statusLabel.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Color divider ── */}
        <View style={s.brandDivider} />

        {/* ── Meta row ── */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Fecha de emisión</Text>
            <Text style={s.metaValue}>{fmtDate(invoice.issued_date)}</Text>
          </View>
          {invoice.due_date && (
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>Fecha de vencimiento</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.due_date)}</Text>
            </View>
          )}
          {project && (
            <View style={s.metaBlock}>
              <Text style={s.metaLabel}>Proyecto</Text>
              <Text style={s.metaValue}>{project.name}</Text>
            </View>
          )}
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Facturar a</Text>
            {client ? (
              <>
                <Text style={s.billToName}>{client.company_name}</Text>
                <Text style={s.metaSubValue}>{client.email}</Text>
                {client.phone && <Text style={s.metaSubValue}>{client.phone}</Text>}
              </>
            ) : (
              <Text style={s.metaValue}>—</Text>
            )}
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={s.table}>
          {/* Header */}
          <View style={s.tableHeaderRow}>
            <Text style={[s.tableHeaderCell, s.descCol]}>Descripción</Text>
            <Text style={[s.tableHeaderCell, s.qtyCol]}>Cant.</Text>
            <Text style={[s.tableHeaderCell, s.priceCol]}>Precio unit.</Text>
            <Text style={[s.tableHeaderCell, s.totalCol]}>Total</Text>
          </View>

          {/* Rows */}
          {items.map((item, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={[s.tableCell, s.descCol]}>{item.description}</Text>
              <Text style={[s.tableCell, s.qtyCol]}>{item.quantity}</Text>
              <Text style={[s.tableCell, s.priceCol]}>
                {fmtCurrency(item.unit_price, curr)}
              </Text>
              <Text style={[s.tableCell, s.totalCol]}>
                {fmtCurrency(item.amount, curr)}
              </Text>
            </View>
          ))}

          {items.length === 0 && (
            <View style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 1, color: '#94a3b8' }]}>Sin ítems</Text>
            </View>
          )}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmtCurrency(invoice.subtotal, curr)}</Text>
            </View>
            {invoice.tax_rate > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>IVA ({invoice.tax_rate}%)</Text>
                <Text style={s.totalValue}>{fmtCurrency(invoice.tax_amount, curr)}</Text>
              </View>
            )}
            <View style={s.grandTotalRow}>
              <Text style={s.grandTotalLabel}>TOTAL</Text>
              <Text style={s.grandTotalValue}>{fmtCurrency(invoice.total, curr)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {invoice.notes && (
          <View style={s.notesSection}>
            <Text style={s.notesLabel}>Notas</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {invoice.invoice_number} · {fmtDate(invoice.issued_date)}
          </Text>
          <Text style={s.footerBrand}>Simplemente</Text>
          <Text style={s.footerText}>
            Total: {fmtCurrency(invoice.total, curr)}
          </Text>
        </View>

      </Page>
    </Document>
  )
}
