export function buildLeadQualifyPrompt(lead: {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  message?: string | null
  project_type?: string | null
  budget_range?: string | null
  source: string
}): string {
  return `Sos un experto en ventas de una agencia de desarrollo web uruguaya llamada Simplemente.
Analizá este lead y devolvé una calificación en formato JSON.

## Lead
- Nombre: ${lead.name}
- Email: ${lead.email ?? 'No proporcionado'}
- Teléfono: ${lead.phone ?? 'No proporcionado'}
- Empresa: ${lead.company ?? 'No proporcionado'}
- Fuente: ${lead.source}
- Mensaje: ${lead.message ?? 'No proporcionado'}
- Tipo de proyecto: ${lead.project_type ?? 'No especificado'}
- Rango de presupuesto: ${lead.budget_range ?? 'No especificado'}

## Criterios de calificación (score 0-100)
- 0-30: Lead frío (información mínima, sin intención clara)
- 31-60: Lead tibio (tiene alguna necesidad pero falta definición)
- 61-80: Lead caliente (necesidad clara, tiene presupuesto estimado)
- 81-100: Lead muy caliente (necesidad urgente, presupuesto definido, empresa real)

Respondé ÚNICAMENTE con este JSON (sin markdown, sin explicaciones):
{
  "score": <número 0-100>,
  "notes": "<resumen en 2-3 oraciones sobre el lead y su necesidad>",
  "next_action": "<acción concreta sugerida, ej: 'Llamar hoy para agendar demo', 'Enviar propuesta de landing básica'>",
  "estimated_value": "<rango estimado del proyecto en USD, ej: '$300-$600'>",
  "urgency": "<baja|media|alta>"
}`
}
