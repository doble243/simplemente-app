import { aiComplete } from '@/lib/ai/client'
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/ai/prompts/chatbot'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

const schema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .default([]),
  sessionId: z.string().optional(),
  leadData: z
    .object({ name: z.string().optional(), email: z.string().email().optional() })
    .optional(),
})

// Extrae el primer objeto JSON del string, aunque haya texto libre antes/después
function extractJSON(raw: string): { text: string; suggestions: string[] } | null {
  const start = raw.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let end   = -1
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++
    else if (raw[i] === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) return null
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1))
    if (typeof parsed.text !== 'string') return null
    return {
      text:        parsed.text,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    }
  } catch { return null }
}

// Guarda el par usuario/asistente en la tabla chat_logs (best-effort, no bloquea)
async function saveChatLog(opts: {
  sessionId: string
  userMessage: string
  assistantMessage: string
  ip: string
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from('chat_logs').insert({
      session_id:        opts.sessionId,
      user_message:      opts.userMessage,
      assistant_message: opts.assistantMessage,
      ip_hash:           opts.ip.slice(-6), // guardar solo sufijo por privacidad
      created_at:        new Date().toISOString(),
    })
  } catch { /* no bloquear la respuesta si falla */ }
}

export async function POST(request: Request) {
  const ip = getClientIP(request)
  const rl = rateLimit(`chat:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) {
    return new Response('Demasiados mensajes. Intentá en una hora.', { status: 429 })
  }

  let body: unknown
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid request', { status: 422 })

  const { message, history, leadData, sessionId } = parsed.data
  const sid = sessionId ?? ip

  // Guardar lead si viene con datos
  if (leadData?.email || leadData?.name) {
    const supabase = createAdminClient()
    supabase.from('leads').insert({
      name:    leadData.name ?? 'Lead via chatbot',
      email:   leadData.email ?? null,
      source:  'chatbot',
      message,
    }).then(() => {}, console.error)
  }

  // Solo los últimos 6 mensajes para contexto
  const recentHistory = history.slice(-6)

  const messages = [
    { role: 'system' as const, content: CHATBOT_SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user' as const, content: message },
  ]

  let raw: string
  try {
    const result = await aiComplete({
      max_tokens:  200,
      temperature: 0.35,
      messages,
    })
    raw = result.text
  } catch (err) {
    console.error('AI error in chat:', err)
    return Response.json({
      text: 'Hubo un error. Intentá de nuevo.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Contar mi proyecto'],
    }, { status: 503 })
  }

  const extracted = extractJSON(raw)
  const responseText = extracted?.text ?? (raw.replace(/\{[\s\S]*\}/g, '').trim() || '¿Podés contarme un poco más sobre lo que necesitás?')
  const responseSuggestions = extracted?.suggestions ?? ['¿Cuánto cuesta?', 'Ver ejemplos', 'Contar mi proyecto']

  // Guardar en DB para entrenamiento (fire-and-forget)
  saveChatLog({ sessionId: sid, userMessage: message, assistantMessage: responseText, ip })

  return Response.json({ text: responseText, suggestions: responseSuggestions })
}
