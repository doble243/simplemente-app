'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderKanban, FileText, MessageSquare, HardDrive, LogOut } from 'lucide-react'

const links = [
  { href: '/portal', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/portal/proyectos', icon: FolderKanban, label: 'Proyectos' },
  { href: '/portal/facturas', icon: FileText, label: 'Facturas' },
  { href: '/portal/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { href: '/portal/archivos', icon: HardDrive, label: 'Archivos' },
]

interface PortalNavProps {
  userName: string
}

export function PortalNav({ userName }: PortalNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <img src="/logo.svg" alt="Simplemente" width={24} height={24} />
            Simplemente
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/portal' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
