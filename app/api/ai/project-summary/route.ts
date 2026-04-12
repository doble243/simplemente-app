import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiComplete, AI_LIMITS } from '@/lib/ai/client'
import { buildProjectSummaryPrompt } from '@/lib/ai/prompts/project-summary'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await request.json().catch(() => ({}))
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const admin = createAdminClient()

  // Check cache: if summary generated < 24h ago, return it
  const { data: cached } = await admin
    .from('ai_conversations')
    .select('messages, created_at')
    .eq('type', 'project_summary')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime()
    if (age < 24 * 60 * 60 * 1000) {
      const lastMsg = cached.messages?.[cached.messages.length - 1]
      if (lastMsg?.role === 'assistant') {
        return NextResponse.json({ summary: lastMsg.content, cached: true })
      }
    }
  }

  // Fetch project data
  const [{ data: project }, { data: milestones }, { data: recentMessages }] = await Promise.all([
    admin.from('projects').select('*').eq('id', projectId).single(),
    admin.from('milestones').select('*').eq('project_id', projectId).order('sort_order'),
    admin.from('messages').select('content, is_from_client, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(10),
  ])

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const prompt = buildProjectSummaryPrompt(project, milestones ?? [], recentMessages ?? [])

  const { text: summary, tokens } = await aiComplete({
    max_tokens: AI_LIMITS.projectSummary,
    messages: [{ role: 'user', content: prompt }],
  })

  // Cache the result
  await admin.from('ai_conversations').insert({
    type: 'project_summary',
    project_id: projectId,
    messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: summary }],
    tokens_used: tokens,
  })

  return NextResponse.json({ summary, cached: false })
}
