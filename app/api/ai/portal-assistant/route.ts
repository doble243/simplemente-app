import { createClient } from '@/lib/supabase/server'
import { aiStream, AI_LIMITS } from '@/lib/ai/client'
import { createAdminClient } from '@/lib/supabase/admin'

const SYSTEM_PROMPT = `Sos un asistente personal para clientes de Simplemente, una agencia web uruguaya.
Tenés acceso a la información del cliente autenticado: sus proyectos, facturas e hitos.
Respondé siempre en español, de forma clara y útil.
Si el cliente pregunta sobre algo que no está en sus datos, indicá que puede comunicarse con el equipo.
Nunca reveles información de otros clientes.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Get client
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('profile_id', user.id)
    .single()

  if (!client) return new Response('Client not found', { status: 404 })

  const { message, history = [] } = await request.json().catch(() => ({ message: '', history: [] }))
  if (!message) return new Response('Message required', { status: 400 })

  const admin = createAdminClient()

  // Build context from client's data
  const [{ data: projects }, { data: invoices }] = await Promise.all([
    admin.from('projects').select('name, status, progress, url').eq('client_id', client.id),
    admin.from('invoices').select('invoice_number, status, total, currency, due_date').eq('client_id', client.id).in('status', ['sent', 'overdue']),
  ])

  const contextPrompt = `
## Datos del cliente: ${client.company_name}

### Proyectos
${(projects ?? []).map(p => `- ${p.name}: ${p.status}, ${p.progress}% completado${p.url ? `, URL: ${p.url}` : ''}`).join('\n') || 'Sin proyectos'}

### Facturas pendientes
${(invoices ?? []).map(i => `- ${i.invoice_number}: ${i.total} ${i.currency}, vence ${i.due_date ?? 'sin fecha'}`).join('\n') || 'Sin facturas pendientes'}
`

  const messages = [
    ...history.slice(-8),
    { role: 'user' as const, content: message },
  ]

  const readableStream = await aiStream({
    max_tokens: AI_LIMITS.portalAssistant,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextPrompt },
      ...messages,
    ],
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
