import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  items: z.array(z.object({
    description: z.string().min(1),
    quantity:    z.number().positive(),
    unit_price:  z.number().min(0),
  })).min(1).max(10),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid' }, { status: 422 })

  const { items } = parsed.data
  const admin = createAdminClient()

  // Get current invoice
  const { data: invoice } = await admin.from('invoices').select('*').eq('id', id).single()
  if (!invoice) return Response.json({ error: 'Not found' }, { status: 404 })

  // Get current max sort_order
  const { data: existingItems } = await admin
    .from('invoice_items').select('sort_order').eq('invoice_id', id).order('sort_order', { ascending: false }).limit(1)
  const startOrder = (existingItems?.[0]?.sort_order ?? -1) + 1

  // Insert new items
  const newItemsSubtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  await admin.from('invoice_items').insert(
    items.map((item, idx) => ({
      invoice_id:  id,
      description: item.description,
      quantity:    item.quantity,
      unit_price:  item.unit_price,
      amount:      item.quantity * item.unit_price,
      sort_order:  startOrder + idx,
    }))
  )

  // Recalculate totals
  const newSubtotal   = Number(invoice.subtotal) + newItemsSubtotal
  const newTaxAmount  = newSubtotal * (Number(invoice.tax_rate) / 100)
  const newTotal      = newSubtotal + newTaxAmount

  await admin.from('invoices').update({
    subtotal:   newSubtotal,
    tax_amount: newTaxAmount,
    total:      newTotal,
  }).eq('id', id)

  return Response.json({ ok: true, newTotal })
}
