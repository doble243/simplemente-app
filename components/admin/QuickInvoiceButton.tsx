'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  projectId: string
  hasBudget: boolean
  className?: string
  size?: 'sm' | 'default'
}

export function QuickInvoiceButton({ projectId, hasBudget, className, size = 'default' }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/invoices/from-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      router.push(`/facturas/${data.invoiceId}`)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const isSmall = size === 'sm'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-60',
        isSmall
          ? 'h-7 px-2.5 text-[12px]'
          : 'h-9 px-3.5 text-[13px]',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
    >
      {loading
        ? <Loader2 className={cn('animate-spin', isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        : <Zap className={cn(isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {loading ? 'Creando...' : hasBudget ? 'Factura rápida' : 'Nueva factura'}
    </button>
  )
}
