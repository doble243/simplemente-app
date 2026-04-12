import Link from 'next/link'
import { Topbar } from '@/components/admin/Topbar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/dates'

const PIPELINE = [
  { key: 'new', label: 'Nuevo', color: 'bg-blue-500' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
  { key: 'qualified', label: 'Calificado', color: 'bg-purple-500' },
  { key: 'proposal', label: 'Propuesta', color: 'bg-orange-500' },
  { key: 'won', label: 'Ganado', color: 'bg-green-500' },
]

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, company, source, status, score, ai_notes, next_action, created_at')
    .not('status', 'eq', 'lost')
    .order('created_at', { ascending: false })

  const byStatus = PIPELINE.reduce((acc, col) => {
    acc[col.key] = (leads ?? []).filter((l) => l.status === col.key)
    return acc
  }, {} as Record<string, typeof leads>)

  return (
    <>
      <Topbar title="Leads" />
      <main className="p-6">
        <p className="text-sm text-muted-foreground mb-6">{leads?.length ?? 0} leads activos</p>

        {/* Pipeline Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE.map((col) => (
            <div key={col.key} className="flex-shrink-0 w-64">
              <div className="rounded-lg bg-accent border p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${col.color}`} />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {col.label}
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">{byStatus[col.key]?.length ?? 0}</span>
                </div>

                <div className="space-y-2">
                  {(byStatus[col.key] ?? []).map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block bg-card rounded-lg border p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-foreground leading-snug">{lead.name}</p>
                        {lead.score != null && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            lead.score >= 70 ? 'bg-green-100 text-green-700' :
                            lead.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {lead.score}
                          </span>
                        )}
                      </div>
                      {lead.company && <p className="text-xs text-muted-foreground mt-0.5">{lead.company}</p>}
                      {lead.next_action && (
                        <p className="text-xs text-blue-600 mt-1.5 line-clamp-2">{lead.next_action}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1.5">{formatDate(lead.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
