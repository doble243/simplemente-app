'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] text-foreground/50 transition-all duration-200 hover:border-foreground/[0.14] hover:bg-foreground/[0.08] hover:text-foreground"
    >
      {isDark
        ? <Sun  className="h-4 w-4" />
        : <Moon className="h-4 w-4" />
      }
    </button>
  )
}
