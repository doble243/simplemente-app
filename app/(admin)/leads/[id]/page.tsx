import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Brain, Mail, Phone, Building2 } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/utils/dates'

interface Props { params: Promise<{ id: string }> }

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single()
  if (!lead) notFound()

  return (
    <>
      <Topbar title={lead.name} />
      <main className="p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-muted-foreground">
          <Link href="/leads"><ArrowLeft className="h-4 w-4" />Leads</Link>
        </Button>

        {/* Lead header */}
        <div className="rounded-xl border bg-card p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
              <p className="text-muted-foreground text-xs mt-0.5">{timeAgo(lead.created_at)} · {lead.source}</p>
            </div>
            <Badge variant="outline">{lead.status}</Badge>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {lead.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary">{lead.email}</a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>

          {lead.message && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Mensaje</p>
              <p className="text-sm text-foreground leading-relaxed">{lead.message}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
            {lead.project_type && (
              <div>
                <p className="text-xs text-muted-foreground">Tipo de proyecto</p>
                <p className="font-medium">{lead.project_type}</p>
              </div>
            )}
            {lead.budget_range && (
              <div>
                <p className="text-xs text-muted-foreground">Presupuesto</p>
                <p className="font-medium">{lead.budget_range}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {(lead.score != null || lead.ai_notes) && (
          <div className="rounded-xl border bg-purple-50 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <h2 className="font-semibold text-purple-900 text-sm">Análisis IA</h2>
              {lead.score != null && (
                <span className={`ml-auto text-sm font-bold px-2.5 py-0.5 rounded-full ${
                  lead.score >= 70 ? 'bg-green-100 text-green-700' :
                  lead.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  Score: {lead.score}/100
                </span>
              )}
            </div>

            {lead.ai_notes && (
              <p className="text-sm text-purple-800 leading-relaxed mb-3">{lead.ai_notes}</p>
            )}

            {lead.next_action && (
              <div className="bg-card rounded-lg p-3 border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Próxima acción sugerida</p>
                <p className="text-sm text-foreground">{lead.next_action}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {lead.email && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${lead.email}`}>Enviar email</a>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/clientes/nuevo?lead=${id}`}>Convertir en cliente</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
