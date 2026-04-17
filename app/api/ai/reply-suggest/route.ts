import { NextResponse } from 'next/server'
import { z } from 'zod'
import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildReplySuggestPrompt } from '@/lib/ai/prompts/reply-suggest'

const schema = z.object({
  leadId: z.string().uuid(),
  channel: z.enum(['whatsapp', 'email']).default('whatsapp'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })

  const { leadId, channel } = parsed.data
  const admin = createAdminClient()

  const { data: lead } = await admin
    .from('leads')
    .select('name, message, project_type, budget_range, source')
    .eq('id', leadId)
    .single()

  if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

  const prompt = buildReplySuggestPrompt(lead)

  try {
    const result = await aiComplete({
      max_tokens:  AI_LIMITS.portalAssistant,
      temperature: 0.85,   // a bit creative — sounds more human
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Redactá la respuesta para enviar por ${channel === 'whatsapp' ? 'WhatsApp' : 'email'}.` },
      ],
    })

    // Clean up: remove surrounding quotes if AI wrapped the text
    const text = result.text
      .trim()
      .replace(/^["']|["']$/g, '')
      .trim()

    return NextResponse.json({ text, channel })
  } catch (err) {
    console.error('reply-suggest error:', err)
    return NextResponse.json({ error: 'Error generando la sugerencia. ¿Está el modelo corriendo?' }, { status: 503 })
  }
}
