import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/ai/prompts/chatbot'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

const schema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
  // Optional: capture lead from chatbot
  leadData: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
})

export async function POST(request: Request) {
  // Rate limit: 20 messages per hour per IP
  const rl = rateLimit(`chat:${getClientIP(request)}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) {
    return new Response('Demasiados mensajes. Intentá en una hora.', { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return new Response('Invalid request', { status: 422 })
  }

  const { message, history, leadData } = parsed.data

  const messages = [
    ...history,
    { role: 'user' as const, content: message },
  ]

  // If lead data is provided, save it
  if (leadData?.email || leadData?.name) {
    const supabase = createAdminClient()
    supabase
      .from('leads')
      .insert({
        name: leadData.name ?? 'Lead via chatbot',
        email: leadData.email ?? null,
        source: 'chatbot',
        message,
      })
      .then(() => {}, console.error)
  }

  // Get response as JSON with text + suggestions
  let raw: string
  try {
    const result = await aiComplete({
      max_tokens: AI_LIMITS.chatbot,
      messages: [{ role: 'system', content: CHATBOT_SYSTEM_PROMPT }, ...messages],
    })
    raw = result.text
  } catch (err) {
    console.error('AI error in chat:', err)
    return Response.json({ text: 'Error del asistente. Intentá de nuevo en unos segundos.', suggestions: [] }, { status: 503 })
  }

  // Parse JSON from AI response
  let text = raw
  let suggestions: string[] = []
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    text = parsed.text ?? raw
    suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : []
  } catch {
    // AI didn't return valid JSON — use raw text, no suggestions
  }

  return Response.json({ text, suggestions })
}
