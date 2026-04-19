import { aiComplete } from '@/lib/ai/client'
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/ai/prompts/chatbot'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

const schema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(30)
    .default([]),
  sessionId: z.string().optional(),
  leadCaptured: z.boolean().optional().default(false),
})

type ChatMode = 'chat' | 'capture' | 'closing'
type LeadIntent = 'low' | 'medium' | 'high'

interface ChatResponse {
  text: string
  suggestions: string[]
  mode: ChatMode
  lead_intent: LeadIntent
}

// Extrae el primer objeto JSON del string, aunque haya texto libre antes/después
function extractJSON(raw: string): ChatResponse | null {
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
    const mode: ChatMode = parsed.mode === 'capture' || parsed.mode === 'closing' ? parsed.mode : 'chat'
    const lead_intent: LeadIntent =
      parsed.lead_intent === 'high' || parsed.lead_intent === 'medium' ? parsed.lead_intent : 'low'
    return {
      text:        parsed.text,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
      mode,
      lead_intent,
    }
  } catch { return null }
}

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
      ip_hash:           opts.ip.slice(-6),
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

  const { message, history, sessionId, leadCaptured } = parsed.data
  const sid = sessionId ?? ip

  const leadStateNote = leadCaptured
    ? 'ESTADO DEL SISTEMA: LEAD_CAPTURED=true. El usuario ya dejó su nombre y un contacto válido. NO vuelvas a pedir datos de contacto. No prometas envíos.'
    : 'ESTADO DEL SISTEMA: LEAD_CAPTURED=false. Todavía no tenemos el contacto del usuario. Si muestra intención alta, usá mode: "capture". Nunca prometas que mandás/enviás nada.'

  const messages = [
    { role: 'system' as const, content: CHATBOT_SYSTEM_PROMPT },
    { role: 'system' as const, content: leadStateNote },
    ...history,
    { role: 'user' as const, content: message },
  ]

  let raw: string
  try {
    const result = await aiComplete({
      max_tokens:  320,
      temperature: 0.5,
      json_mode:   true,
      messages,
    })
    raw = result.text
  } catch (err) {
    console.error('AI error in chat:', err)
    return Response.json({
      text: 'Hubo un error. Intentá de nuevo.',
      suggestions: ['¿Cuánto cuesta?', 'Ver ejemplos', 'Contar mi proyecto'],
      mode: 'chat',
      lead_intent: 'low',
    }, { status: 503 })
  }

  const extracted = extractJSON(raw)
  const response: ChatResponse = {
    text:        extracted?.text ?? '¿Podés contarme un poco más? No me quedó claro qué necesitás.',
    suggestions: extracted?.suggestions ?? ['Una página web', 'Una tienda online', 'Algo a medida'],
    mode:        extracted?.mode ?? 'chat',
    lead_intent: extracted?.lead_intent ?? 'low',
  }

  // Red de seguridad: si el modelo igual coló frases prohibidas, las limpiamos
  if (!leadCaptured) {
    const banned = /(te mando|te env[ií]o|te paso (la )?info|te dejo mis datos|ya te mand[ée]|qued[óo] pronto|te lo mand[ée])/i
    if (banned.test(response.text)) {
      response.text = 'Para avanzar con eso necesito tu nombre y un WhatsApp o mail. ¿Me los dejás?'
      response.mode = 'capture'
      response.lead_intent = 'high'
      response.suggestions = ['Dejar mis datos', 'Todavía no', 'Contame más']
    }
  }

  saveChatLog({ sessionId: sid, userMessage: message, assistantMessage: response.text, ip })

  return Response.json(response)
}
