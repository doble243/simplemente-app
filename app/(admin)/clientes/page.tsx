import Link from 'next/link'
import { Plus, Mail, Phone } from 'lucide-react'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Activo',    cls: 'badge-green' },
  prospect: { label: 'Prospecto', cls: 'badge-blue' },
  inactive: { label: 'Inactivo',  cls: 'badge-muted' },
}

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, email, phone, status, city, country, created_at')
    .order('company_name')

  const list = clients ?? []

  const newBtn = (
    <Link
      href="/clientes/nuevo"
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-8 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />Nuevo
    </Link>
  )

  return (
    <>
      <Topbar title="Clientes" actions={newBtn} />
      <main className="page-shell">

        <p className="text-[12px] text-muted-foreground mb-3">{list.length} clientes</p>

        {/* Mobile: cards (block md:hidden) */}
        <div className="space-y-2 md:hidden">
          {list.map(c => {
            const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.inactive
            return (
              <Link key={c.id} href={`/clientes/${c.id}`}
                className="card-base flex items-center gap-3 p-3.5 interactive">
                {/* Avatar initial */}
                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-primary">
                    {c.company_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{c.company_name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{c.email}</p>
                  {c.city && <p className="text-[11px] text-muted-foreground/60">{c.city}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                  {st.label}
                </span>
              </Link>
            )
          })}
          {list.length === 0 && (
            <div className="card-base py-10 text-center">
              <p className="text-sm text-muted-foreground">Sin clientes todavía.</p>
              <Link href="/clientes/nuevo" className="mt-2 inline-block text-sm link-primary">Creá el primero →</Link>
            </div>
          )}
        </div>

        {/* Desktop: refined table (hidden md:block) */}
        <div className="hidden md:block card-base overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left">
                <th className="px-4 py-3 label-xs">Empresa</th>
                <th className="px-4 py-3 label-xs">Contacto</th>
                <th className="px-4 py-3 label-xs hidden lg:table-cell">Ciudad</th>
                <th className="px-4 py-3 label-xs">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {list.map(c => {
                const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.inactive
                return (
                  <tr key={c.id} className="interactive cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${c.id}`}
                        className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors">
                        {c.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <a href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="h-3 w-3" />{c.email}
                        </a>
                        {c.phone && (
                          <a href={`tel:${c.phone}`}
                            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="h-3 w-3" />{c.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[13px] text-muted-foreground">
                      {c.city ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                    Sin clientes todavía.{' '}
                    <Link href="/clientes/nuevo" className="link-primary">Creá el primero</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
