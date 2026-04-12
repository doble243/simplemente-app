import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  return (
    <div className={cn('card-elevated p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-xs mb-1.5">{title}</p>
          <p className="stat-value text-xl sm:text-2xl">{value}</p>
          {subtitle && (
            <p className={cn(
              'mt-1 text-[12px] font-medium',
              trend === 'up'   && 'text-[var(--badge-success-text)]',
              trend === 'down' && 'text-[var(--badge-danger-text)]',
              (!trend || trend === 'neutral') && 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-lg bg-primary/10 p-2 sm:p-2.5">
          <Icon className="h-4 w-4 text-primary sm:h-[18px] sm:w-[18px]" />
        </div>
      </div>
    </div>
  )
}
