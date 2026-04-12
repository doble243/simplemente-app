'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, FileText, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/proyectos', icon: FolderKanban,    label: 'Proyectos' },
  { href: '/clientes',  icon: Users,           label: 'Clientes' },
  { href: '/facturas',  icon: FileText,        label: 'Facturas' },
  { href: '/leads',     icon: UserPlus,        label: 'Leads' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-primary' : 'text-muted-foreground/60')} />
              {label}
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
