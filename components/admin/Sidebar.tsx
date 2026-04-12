'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderKanban, FileText,
  UserPlus, MessageSquare, HardDrive, BarChart3, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const primaryNav = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clientes',      icon: Users,            label: 'Clientes' },
  { href: '/proyectos',     icon: FolderKanban,     label: 'Proyectos' },
  { href: '/facturas',      icon: FileText,         label: 'Facturas' },
  { href: '/leads',         icon: UserPlus,         label: 'Leads' },
]

const secondaryNav = [
  { href: '/mensajes',      icon: MessageSquare,    label: 'Mensajes' },
  { href: '/archivos',      icon: HardDrive,        label: 'Archivos' },
  { href: '/reportes',      icon: BarChart3,        label: 'Reportes' },
  { href: '/configuracion', icon: Settings,         label: 'Configuración' },
]

function NavItem({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-100',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
      )}
    >
      <Icon className={cn(
        'h-[15px] w-[15px] shrink-0 transition-colors',
        active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
      )} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-1 w-1 rounded-full bg-primary opacity-80" />
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside
      className="hidden h-screen w-[220px] shrink-0 flex-col border-r border-border/60 bg-sidebar sticky top-0 md:flex"
    >
      {/* Logo */}
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border/60 px-4">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/12">
          <img src="/logo.svg" alt="" width={16} height={16} className="opacity-90" />
        </div>
        <Link
          href="/dashboard"
          className="text-[13px] font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          Simplemente
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {primaryNav.map(item => <NavItem key={item.href} {...item} />)}

        <div className="my-2.5 mx-1 border-t border-border/50" />

        {secondaryNav.map(item => <NavItem key={item.href} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
          Admin · v2
        </p>
      </div>
    </aside>
  )
}
