// OpenAI-compatible AI client. Producción: Groq (https://api.groq.com/openai/v1)

const AI_BASE_URL = (process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1').replace(/\/$/, '')
const AI_API_KEY  = process.env.AI_API_KEY ?? ''

export const AI_MODEL = process.env.AI_MODEL ?? 'llama-3.3-70b-versatile'

export const AI_LIMITS = {
  chatbot:         150,   // JSON tiny response: {"text":"...","suggestions":[...]}
  leadQualify:     256,
  quoteGenerator:  2048,
  projectSummary:  2048,
  portalAssistant: 1024,
} as const

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionOptions {
  messages:        ChatMessage[]
  max_tokens?:     number
  model?:          string
  temperature?:    number
  json_mode?:      boolean
}

// ── Non-streaming completion ───────────────────────────────────────────────

export async function aiComplete(
  options: CompletionOptions
): Promise<{ text: string; tokens: number }> {
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model:           options.model ?? AI_MODEL,
      messages:        options.messages,
      max_tokens:      options.max_tokens,
      temperature:     options.temperature ?? 0.7,
      stream:          false,
      ...(options.json_mode && { response_format: { type: 'json_object' } }),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI API ${res.status}: ${body}`)
  }

  const json = await res.json()
  const text   = (json.choices?.[0]?.message?.content ?? '') as string
  const tokens = (json.usage?.total_tokens ?? 0) as number
  return { text, tokens }
}

// ── Streaming completion → ReadableStream<Uint8Array> ─────────────────────

export async function aiStream(
  options: CompletionOptions
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model:      options.model ?? AI_MODEL,
      messages:   options.messages,
      max_tokens: options.max_tokens,
      stream:     true,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI API ${res.status}: ${body}`)
  }
  if (!res.body) throw new Error('AI API devolvió respuesta vacía')

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = res.body!.getReader()
      let buf = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            const raw = line.trim()
            if (!raw.startsWith('data:')) continue
            const data = raw.slice(5).trim()
            if (data === '[DONE]') { controller.close(); return }
            try {
              const chunk = JSON.parse(data)
              const text = chunk.choices?.[0]?.delta?.content ?? ''
              if (text) controller.enqueue(encoder.encode(text))
            } catch { /* líneas SSE malformadas — ignorar */ }
          }
        }
      } finally {
        reader.releaseLock()
      }
      controller.close()
    },
  })
}
