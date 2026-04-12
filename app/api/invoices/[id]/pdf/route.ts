import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { InvoicePDFDocument } from '@/components/pdf/InvoicePDFDocument'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Fetch invoice + items + client + project
  const [{ data: invoice }, { data: items }] = await Promise.all([
    admin
      .from('invoices')
      .select('*, clients(id, company_name, email, phone), projects(id, name)')
      .eq('id', id)
      .single(),
    admin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order'),
  ])

  if (!invoice) {
    return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
  }

  const client = invoice.clients as { id: string; company_name: string; email: string; phone: string | null } | null
  const project = invoice.projects as { id: string; name: string } | null

  // Render PDF
  try {
    const element = React.createElement(InvoicePDFDocument, {
      invoice,
      items: items ?? [],
      client,
      project,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    const filename = `factura-${invoice.invoice_number.replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`

    // Node Buffer → Uint8Array for Web API Response
    const bytes = new Uint8Array(buffer)

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json(
      { error: 'Error generando el PDF. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
