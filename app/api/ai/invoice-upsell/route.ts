import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { z } from 'zod'

const schema = z.object({ invoiceId: z.string().uuid() })

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
  if (!parsed.success) return Response.json({ error: 'Invalid' }, { status: 422 })

  const { invoiceId } = parsed.data

  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase.from('invoices')
      .select('*, projects(name, type, description)')
      .eq('id', invoiceId).single(),
    supabase.from('invoice_items')
      .select('*').eq('invoice_id', invoiceId).order('sort_order'),
  ])

  if (!invoice) return Response.json({ error: 'Factura no encontrada' }, { status: 404 })

  const project = invoice.projects as { name: string; type: string; description: string | null } | null
  const currency = invoice.currency as string
  const existingItems = (items ?? []).map(i => `- ${i.description}: ${i.unit_price} ${currency}`).join('\n')

  const prompt = `Sos un especialista en presupuestos de agencias web uruguayas.

PROYECTO: "${project?.name ?? 'N/A'}"
TIPO: ${TYPE_LABEL[project?.type ?? ''] ?? 'Web'}
${project?.description ? `DESCRIPCIÓN: ${project.description}` : ''}

FACTURA ACTUAL (${currency} ${invoice.total}):
${existingItems || '- Sin ítems'}

El cliente quiere ampliar el alcance o hay costos adicionales. Generá 2-4 ítems adicionales realistas con precios de mercado uruguayo en ${currency}.

Respondé SOLO con JSON válido, sin nada más:
{"items":[{"description":"servicio adicional","quantity":1,"unit_price":0}],"rationale":"Explicación breve de por qué estos adicionales tienen sentido"}`

  let raw: string
  try {
    const result = await aiComplete({
      max_tokens: AI_LIMITS.projectSummary,
      messages: [{ role: 'user', content: prompt }],
    })
    raw = result.text
  } catch {
    return Response.json({ error: 'Error del agente IA' }, { status: 503 })
  }

  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const data = JSON.parse(cleaned)
    return Response.json({
      items:     Array.isArray(data.items) ? data.items.slice(0, 4) : [],
      rationale: data.rationale ?? '',
    })
  } catch {
    return Response.json({ items: [], rationale: raw.slice(0, 200) })
  }
}
