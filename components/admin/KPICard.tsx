import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title:     string
  value:     string | number
  subtitle?: string
  icon:      LucideIcon
  trend?:    'up' | 'down' | 'neutral'
  className?: string
  /** Optional accent color for icon: 'primary' | 'green' | 'red' | 'amber' | 'violet' */
  accent?:   'primary' | 'green' | 'red' | 'amber' | 'violet'
}

const ACCENT_MAP = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    bar:  'bg-primary',
  },
  green: {
    icon: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]',
    bar:  'bg-emerald-400',
  },
  red: {
    icon: 'bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)]',
    bar:  'bg-red-400',
  },
  amber: {
    icon: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]',
    bar:  'bg-amber-400',
  },
  violet: {
    icon: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]',
    bar:  'bg-violet-400',
  },
}

const TREND_CONFIG = {
  up:      { Icon: TrendingUp,   cls: 'text-[var(--badge-success-text)]' },
  down:    { Icon: TrendingDown, cls: 'text-[var(--badge-danger-text)]'  },
  neutral: { Icon: Minus,        cls: 'text-muted-foreground/50'         },
}

export function KPICard({ title, value, subtitle, icon: Icon, trend = 'neutral', accent = 'primary', className }: KPICardProps) {
  const a = ACCENT_MAP[accent]
  const t = TREND_CONFIG[trend]

  return (
    <div className={cn('card-elevated relative overflow-hidden p-4 sm:p-5', className)}>
      {/* Accent bar — top edge */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] rounded-t-xl', a.bar)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="label-xs mb-2">{title}</p>
          <p className="stat-value text-xl sm:text-2xl leading-none">{value}</p>
          {subtitle && (
            <p className={cn('mt-1.5 flex items-center gap-1 text-[12px] font-medium', t.cls)}>
              <t.Icon className="h-3 w-3 shrink-0" />
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('shrink-0 rounded-xl p-2.5', a.icon)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  )
}
