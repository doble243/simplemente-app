import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  taskTitle:           z.string().min(1).max(200),
  projectName:         z.string().min(1).max(200),
  projectType:         z.string().optional(),
  projectDescription:  z.string().optional(),
  milestoneId:         z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid request', { status: 422 })

  const { taskTitle, projectName, projectType, projectDescription } = parsed.data

  const typeLabel: Record<string, string> = {
    web_landing: 'Landing page', web_app: 'Aplicación web', ecommerce: 'E-commerce',
    branding: 'Branding', seo: 'SEO', maintenance: 'Mantenimiento',
  }

  const prompt = `Sos un agente de gestión de proyectos web de la agencia Simplemente (Uruguay).

PROYECTO: "${projectName}"
TIPO: ${typeLabel[projectType ?? ''] ?? projectType ?? 'Web'}
${projectDescription ? `DESCRIPCIÓN: ${projectDescription}` : ''}

TAREA: "${taskTitle}"

Generá un análisis conciso de esta tarea para el equipo de desarrollo. Respondé SOLO con JSON válido:

{
  "brief": "Descripción técnica de la tarea (2-3 oraciones, qué hay que hacer y cómo)",
  "subtasks": ["Sub-tarea 1", "Sub-tarea 2", "Sub-tarea 3", "Sub-tarea 4"],
  "estimate": "X-Y horas",
  "priority": "alta|media|baja",
  "notes": "Una nota técnica o advertencia importante (opcional, máx 1 oración)"
}`

  let raw: string
  try {
    const result = await aiComplete({
      max_tokens: AI_LIMITS.projectSummary,
      messages: [{ role: 'user', content: prompt }],
    })
    raw = result.text
  } catch (err) {
    console.error('AI task-agent error:', err)
    return Response.json({ error: 'Error del agente IA' }, { status: 503 })
  }

  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const data = JSON.parse(cleaned)
    return Response.json({
      brief:     data.brief ?? '',
      subtasks:  Array.isArray(data.subtasks) ? data.subtasks.slice(0, 6) : [],
      estimate:  data.estimate ?? 'N/A',
      priority:  data.priority ?? 'media',
      notes:     data.notes ?? null,
    })
  } catch {
    return Response.json({ brief: raw, subtasks: [], estimate: 'N/A', priority: 'media', notes: null })
  }
}
