import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * DELETE /api/invoices/[id]
 * Permanently deletes an invoice and its line items.
 * Only allowed for draft or cancelled invoices.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Verify invoice exists and status is deletable
  const { data: invoice } = await admin
    .from('invoices')
    .select('id, status, project_id')
    .eq('id', id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
  }

  if (!['draft', 'cancelled'].includes(invoice.status)) {
    return NextResponse.json(
      { error: 'Solo se pueden eliminar facturas en borrador o canceladas.' },
      { status: 422 }
    )
  }

  // Delete items first (FK constraint), then the invoice
  await admin.from('invoice_items').delete().eq('invoice_id', id)
  const { error } = await admin.from('invoices').delete().eq('id', id)

  if (error) {
    console.error('Delete invoice error:', error)
    return NextResponse.json({ error: 'Error al eliminar la factura.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, projectId: invoice.project_id })
}
