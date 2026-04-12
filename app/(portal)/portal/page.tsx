import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, FileText, MessageSquare } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CurrencyType } from '@/types/database'

export default async function PortalHomePage() {
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')
  if (isDemo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hola, Demo Cliente 👋</h1>
          <p className="text-muted-foreground text-sm">Acá podés ver el estado de tus proyectos.</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Conectá Supabase para ver los datos reales del cliente.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get client record
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('profile_id', user.id)
    .single()

  if (!client) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-foreground mb-2">Tu cuenta está siendo configurada</h1>
        <p className="text-muted-foreground">Te avisaremos cuando todo esté listo.</p>
      </div>
    )
  }

  const [
    { data: projects },
    { data: invoices },
    { data: messages },
  ] = await Promise.all([
    supabase.from('projects').select('id, name, status, progress').eq('client_id', client.id).in('status', ['active', 'review']),
    supabase.from('invoices').select('id, invoice_number, total, currency, status').eq('client_id', client.id).in('status', ['sent', 'overdue']).limit(3),
    supabase.from('messages').select('id').eq('client_id', client.id).eq('is_from_client', false).is('read_at', null),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hola, {client.company_name} 👋</h1>
        <p className="text-muted-foreground text-sm">Acá podés ver el estado de tus proyectos.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FolderKanban, label: 'Proyectos activos', value: projects?.length ?? 0, href: '/portal/proyectos' },
          { icon: FileText, label: 'Facturas pendientes', value: invoices?.length ?? 0, href: '/portal/facturas' },
          { icon: MessageSquare, label: 'Mensajes sin leer', value: messages?.length ?? 0, href: '/portal/mensajes' },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link key={href} href={href} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-primary/5 transition-shadow text-center">
            <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Active projects */}
      {(projects ?? []).length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Proyectos en curso</h2>
          <div className="space-y-4">
            {(projects ?? []).map((p) => (
              <Link key={p.id} href={`/portal/proyectos/${p.id}`} className="block hover:bg-accent rounded-lg p-2 -m-2 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-foreground text-sm">{p.name}</p>
                  <Badge variant="outline" className="text-xs">{p.status}</Badge>
                </div>
                <Progress value={p.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{p.progress}% completado</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pending invoices */}
      {(invoices ?? []).length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Facturas pendientes</h2>
          <div className="space-y-2">
            {(invoices ?? []).map((inv) => (
              <Link key={inv.id} href={`/portal/facturas/${inv.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(inv.total, inv.currency as CurrencyType)}
                  </span>
                  <Badge variant={inv.status === 'overdue' ? 'destructive' : 'outline'} className="text-xs">
                    {inv.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
