'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, FileText, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  newLeads?: number
}

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/proyectos', icon: FolderKanban,    label: 'Proyectos' },
  { href: '/clientes',  icon: Users,           label: 'Clientes' },
  { href: '/facturas',  icon: FileText,        label: 'Facturas' },
  { href: '/leads',     icon: UserPlus,        label: 'Leads',    badge: true },
]

export function MobileNav({ newLeads = 0 }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch">
        {tabs.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const showBadge = badge && newLeads > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {/* Icon + badge */}
              <div className="relative">
                <Icon className={cn(
                  'h-[18px] w-[18px]',
                  active ? 'text-primary' : 'text-muted-foreground/60'
                )} />
                {showBadge && (
                  <>
                    {/* Pulsing ring */}
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center">
                      <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-red-500 opacity-60" />
                      <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                        {newLeads > 9 ? '9+' : newLeads}
                      </span>
                    </span>
                  </>
                )}
              </div>

              {/* Label — red when has new leads */}
              <span className={showBadge ? 'text-red-500 font-bold' : ''}>
                {label}
              </span>

              {/* Active top bar */}
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
