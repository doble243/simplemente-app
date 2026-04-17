import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/Topbar'
import { ArrowLeft, Brain, Mail, Phone, Building2, UserCheck } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/utils/dates'
import { LeadStatusActions } from '@/components/admin/LeadStatusActions'
import { LeadContactButtons } from '@/components/admin/LeadContactButtons'
import { LeadReplySuggest } from '@/components/admin/LeadReplySuggest'

interface Props { params: Promise<{ id: string }> }

const STATUS_BADGE: Record<string, string> = {
  new: 'badge-blue', contacted: 'badge-yellow', qualified: 'badge-purple',
  proposal: 'badge-orange', won: 'badge-green', lost: 'badge-muted',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado',
  proposal: 'Propuesta', won: 'Ganado', lost: 'Perdido',
}
const SOURCE_LABEL: Record<string, string> = {
  landing_form: 'Formulario', chatbot: 'Chatbot', referral: 'Referido',
  social: 'Redes', direct: 'Directo',
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single()
  if (!lead) notFound()

  const clientParams = new URLSearchParams({
    name:    lead.name,
    email:   lead.email ?? '',
    phone:   lead.phone ?? '',
    company: lead.company ?? '',
    lead:    id,
  })

  return (
    <>
      <Topbar title={lead.name} />
      <main className="page-shell">
        <div className="max-w-2xl space-y-4">

          <Link href="/leads"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors -ml-0.5">
            <ArrowLeft className="h-3.5 w-3.5" />Leads
          </Link>

          {/* ── Header card ── */}
          <div className="card-elevated p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="heading-page truncate">{lead.name}</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {timeAgo(lead.created_at)} · {SOURCE_LABEL[lead.source] ?? lead.source}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_BADGE[lead.status] ?? 'badge-muted'}`}>
                {STATUS_LABEL[lead.status] ?? lead.status}
              </span>
            </div>

            {/* ── Quick contact buttons (prominent) ── */}
            {(lead.phone || lead.email) && (
              <div className="rounded-xl bg-muted/40 border border-border/50 p-3 flex flex-col gap-2.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Contactar ahora
                </p>
                <LeadContactButtons
                  name={lead.name}
                  phone={lead.phone}
                  email={lead.email}
                  size="md"
                />
              </div>
            )}

            {/* Contact details */}
            <div className="space-y-2">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  {lead.phone}
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  {lead.company}
                </div>
              )}
            </div>

            {/* Message */}
            {lead.message && (
              <div className="border-t border-border/60 pt-4">
                <p className="label-xs mb-2">Mensaje</p>
                <p className="text-[13px] text-foreground leading-relaxed">{lead.message}</p>
              </div>
            )}

            {/* Extra data */}
            {(lead.project_type || lead.budget_range) && (
              <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
                {lead.project_type && (
                  <div>
                    <p className="label-xs mb-1">Tipo de proyecto</p>
                    <p className="text-[13px] font-medium text-foreground">{lead.project_type}</p>
                  </div>
                )}
                {lead.budget_range && (
                  <div>
                    <p className="label-xs mb-1">Presupuesto</p>
                    <p className="text-[13px] font-medium text-foreground">{lead.budget_range}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── AI Analysis ── */}
          {(lead.score != null || lead.ai_notes) && (
            <div className="card-base border-purple-200/60 dark:border-purple-800/40 p-5 bg-purple-50/50 dark:bg-purple-950/10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-purple-500" />
                <p className="text-[13px] font-semibold text-foreground">Análisis IA</p>
                {lead.score != null && (
                  <span className={`ml-auto text-[12px] font-bold px-2 py-0.5 rounded-full ${
                    lead.score >= 70 ? 'badge-green' :
                    lead.score >= 40 ? 'badge-yellow' : 'badge-muted'
                  }`}>
                    Score {lead.score}/100
                  </span>
                )}
              </div>
              {lead.ai_notes && (
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{lead.ai_notes}</p>
              )}
              {lead.next_action && (
                <div className="rounded-lg bg-background border border-border/60 p-3">
                  <p className="label-xs mb-1 text-primary/60">Próxima acción sugerida</p>
                  <p className="text-[13px] text-foreground">{lead.next_action}</p>
                </div>
              )}
            </div>
          )}

          {/* ── AI reply suggestion ── */}
          {(lead.phone || lead.email) && (
            <LeadReplySuggest
              leadId={id}
              name={lead.name}
              phone={lead.phone}
              email={lead.email}
            />
          )}

          {/* ── Status management ── */}
          <LeadStatusActions leadId={id} currentStatus={lead.status} />

          {/* ── Convert to client ── */}
          {lead.status !== 'lost' && (
            <div className="card-base p-4">
              <p className="heading-card mb-3">Convertir en cliente</p>
              <p className="text-[12px] text-muted-foreground mb-3">
                Crea un cliente con los datos de este lead pre-cargados.
              </p>
              <Link
                href={`/clientes/nuevo?${clientParams.toString()}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <UserCheck className="h-4 w-4" />
                Crear cliente desde este lead
              </Link>
            </div>
          )}

          {/* Created */}
          <p className="text-[11px] text-muted-foreground text-center pb-2">
            Lead creado el {formatDate(lead.created_at)}
          </p>

        </div>
      </main>
    </>
  )
}
