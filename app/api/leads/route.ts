import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { buildLeadQualifyPrompt } from '@/lib/ai/prompts/lead-qualify'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  project_type: z.string().optional(),
  budget_range: z.string().optional(),
  source: z.enum(['landing_form', 'chatbot', 'referral', 'social', 'direct']).default('landing_form'),
})

export async function POST(request: Request) {
  // Rate limit: 5 submissions per hour per IP
  const rl = rateLimit(`leads:${getClientIP(request)}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intentá en una hora.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const supabase = createAdminClient()

  // Insert lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      message: data.message ?? null,
      project_type: data.project_type ?? null,
      budget_range: data.budget_range ?? null,
      source: data.source,
    })
    .select()
    .single()

  if (error || !lead) {
    console.error('Error inserting lead:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Trigger AI qualification asynchronously (don't wait)
  qualifyLead(lead.id, data).catch(console.error)

  return NextResponse.json({ id: lead.id }, { status: 201 })
}

async function qualifyLead(
  leadId: string,
  lead: z.infer<typeof schema>
) {
  const supabase = createAdminClient()

  try {
    const prompt = buildLeadQualifyPrompt(lead)
    const { text, tokens } = await aiComplete({
      max_tokens: AI_LIMITS.leadQualify,
      messages: [{ role: 'user', content: prompt }],
    })

    const parsed = JSON.parse(text)

    await supabase
      .from('leads')
      .update({
        score: parsed.score ?? 0,
        ai_notes: parsed.notes ?? null,
        next_action: parsed.next_action ?? null,
      })
      .eq('id', leadId)

    // Log conversation
    await supabase.from('ai_conversations').insert({
      type: 'lead_qualify',
      lead_id: leadId,
      messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: text }],
      metadata: parsed,
      tokens_used: tokens,
    })
  } catch (err) {
    console.error('AI qualification failed for lead', leadId, err)
  }
}
