import type { Project, Milestone } from '@/types/database'

export function buildProjectSummaryPrompt(
  project: Project,
  milestones: Milestone[],
  recentMessages: Array<{ content: string; is_from_client: boolean; created_at: string }>
): string {
  const completedMilestones = milestones.filter(m => m.status === 'completed')
  const pendingMilestones = milestones.filter(m => m.status !== 'completed')

  const milestonesSummary = milestones
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(m => `- [${m.status === 'completed' ? 'x' : ' '}] ${m.title} (${m.status})`)
    .join('\n')

  const messagesSummary = recentMessages
    .slice(-10)
    .map(m => `[${m.is_from_client ? 'Cliente' : 'Agencia'}] ${m.content}`)
    .join('\n')

  return `Sos un project manager de una agencia web uruguaya. Generá un resumen ejecutivo del siguiente proyecto.

## Proyecto: ${project.name}
- Estado: ${project.status}
- Progreso: ${project.progress}%
- Tipo: ${project.type}
- URL: ${project.url ?? 'No lanzado aún'}
- Inicio: ${project.start_date ?? 'No definido'}
- Fin estimado: ${project.end_date ?? 'No definido'}

## Hitos (${completedMilestones.length}/${milestones.length} completados)
${milestonesSummary || 'Sin hitos definidos'}

## Mensajes recientes del proyecto
${messagesSummary || 'Sin mensajes'}

Generá un resumen ejecutivo en markdown con estas secciones:
1. **Estado general** (1 párrafo)
2. **Trabajo completado** (bullets)
3. **Pendiente** (bullets)
4. **Riesgos o bloqueos** (bullets, o "Sin riesgos identificados")
5. **Próximos pasos** (bullets con responsable: Agencia o Cliente)

Escribí en español, tono profesional pero claro. Máximo 300 palabras.`
}
