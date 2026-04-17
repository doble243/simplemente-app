'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, ChevronRight } from 'lucide-react'

interface TopbarProps {
  title?:    string
  /** If provided, renders "Section / title" breadcrumb instead of just title */
  section?:  string
  actions?:  React.ReactNode
}

export function Topbar({ title, section, actions }: TopbarProps) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-[52px] items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl md:px-6">

      {/* Left — title / breadcrumb */}
      <div className="flex min-w-0 items-center gap-1.5">
        {section && (
          <>
            <span className="hidden truncate text-[13px] font-medium text-muted-foreground sm:block">
              {section}
            </span>
            <ChevronRight className="hidden h-3 w-3 shrink-0 text-muted-foreground/40 sm:block" />
          </>
        )}
        {title && (
          <h1 className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
      </div>

      {/* Right — actions + logout */}
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <div className="h-4 w-px bg-border/60" />
        <button
          onClick={handleLogout}
          className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
