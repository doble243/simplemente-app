import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({ projectId: z.string().uuid() })

function invoiceNumber() {
  const now = new Date()
  return `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`
}
function dueDateStr(days = 30) {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
const TYPE_LABEL: Record<string, string> = {
  web_landing: 'Landing page', web_app: 'Aplicación web', ecommerce: 'E-commerce',
  branding: 'Branding', seo: 'SEO', maintenance: 'Mantenimiento',
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 422 })

  const { projectId } = parsed.data

  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id, name, type, client_id, budget, currency')
    .eq('id', projectId)
    .single()

  if (projErr || !project) return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })

  const budget = Number(project.budget ?? 0)
  const currency = (project.currency ?? 'USD') as 'USD' | 'UYU'
  const TAX_RATE = currency === 'UYU' ? 22 : 0
  const subtotal = budget
  const taxAmount = subtotal * (TAX_RATE / 100)
  const total = subtotal + taxAmount

  const admin = createAdminClient()
  const { data: invoice, error: invErr } = await admin
    .from('invoices')
    .insert({
      client_id:      project.client_id,
      project_id:     projectId,
      invoice_number: invoiceNumber(),
      status:         'draft',
      currency,
      subtotal,
      tax_rate:   TAX_RATE,
      tax_amount: taxAmount,
      total,
      issued_date: new Date().toISOString().split('T')[0],
      due_date:    dueDateStr(30),
      created_by:  user.id,
    })
    .select('id')
    .single()

  if (invErr || !invoice) return Response.json({ error: invErr?.message ?? 'Error al crear factura' }, { status: 500 })

  if (budget > 0) {
    await admin.from('invoice_items').insert({
      invoice_id:  invoice.id,
      description: `${TYPE_LABEL[project.type] ?? 'Desarrollo web'}: ${project.name}`,
      quantity:    1,
      unit_price:  budget,
      amount:      budget,
      sort_order:  0,
    })
  }

  return Response.json({ invoiceId: invoice.id })
}
