'use client'

import { Mail, MessageCircle, Loader2, FileText } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'

interface Props {
  invoiceNumber: string
  clientEmail:   string | null
  clientPhone:   string | null
  clientName:    string
  total:         number
  currency:      CurrencyType
  invoiceId:     string
}

export function InvoiceShareButtons({
  invoiceNumber, clientEmail, clientPhone, clientName, total, currency, invoiceId
}: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)

  async function openPdf() {
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      alert('Error generando el PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const subject  = encodeURIComponent(`Factura ${invoiceNumber} — Simplemente`)
  const body     = encodeURIComponent(
    `Hola ${clientName},\n\nTe adjunto la factura ${invoiceNumber} por ${formatCurrency(total, currency)}.\n\nSaludos,\nSimplemente`
  )
  const mailUrl  = `mailto:${clientEmail ?? ''}?subject=${subject}&body=${body}`

  const waText   = encodeURIComponent(
    `Hola ${clientName}! Te envío la factura *${invoiceNumber}* por *${formatCurrency(total, currency)}*. Podés verla en: ${typeof window !== 'undefined' ? window.location.href : ''}`
  )
  const phone    = (clientPhone ?? '').replace(/\D/g, '')
  const waUrl    = `https://wa.me/${phone || ''}?text=${waText}`

  return (
    <div className="card-base p-4 space-y-3">
      <p className="heading-card">Enviar factura</p>
      <div className="flex flex-wrap gap-2">
        {/* PDF */}
        <button
          onClick={openPdf}
          disabled={pdfLoading}
          className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-accent/60 transition-colors disabled:opacity-60"
        >
          {pdfLoading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
          Ver PDF
        </button>

        {/* Email */}
        {clientEmail && (
          <a
            href={mailUrl}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-950/20 px-3 py-2 text-[12px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
            <span className="hidden sm:inline text-[11px] opacity-70">({clientEmail})</span>
          </a>
        )}

        {/* WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-950/20 px-3 py-2 text-[12px] font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
          {clientPhone && <span className="hidden sm:inline text-[11px] opacity-70">({clientPhone})</span>}
        </a>
      </div>
    </div>
  )
}
