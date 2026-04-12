import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { buildQuotePrompt } from '@/lib/ai/prompts/quote-generator'
import { calculateInvoiceTotals } from '@/lib/utils/currency'

const schema = z.object({
  projectType: z.string().min(1),
  description: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  currency: z.enum(['UYU', 'USD']).default('USD'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { projectType, description, requirements, currency } = parsed.data

  const prompt = buildQuotePrompt({ projectType, description, requirements, currency })

  let text: string
  let tokens: number
  try {
    ;({ text, tokens } = await aiComplete({
      max_tokens: AI_LIMITS.quoteGenerator,
      messages: [{ role: 'user', content: prompt }],
    }))
  } catch (err) {
    console.error('AI error in generate-quote:', err)
    return NextResponse.json(
      { error: 'Error al contactar la IA. Intentá de nuevo en unos segundos.' },
      { status: 503 }
    )
  }

  let result: {
    items: Array<{ description: string; quantity: number; unit_price: number; amount: number }>
    subtotal: number
    notes: string
    delivery_weeks: number
  }

  try {
    result = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'IA devolvió formato inválido' }, { status: 500 })
  }

  const totals = calculateInvoiceTotals(result.items, currency)

  return NextResponse.json({
    items: result.items,
    ...totals,
    notes: result.notes,
    delivery_weeks: result.delivery_weeks,
    tokens_used: tokens,
  })
}
