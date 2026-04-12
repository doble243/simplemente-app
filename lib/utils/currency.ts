import type { CurrencyType } from '@/types/database'

// IVA Uruguay: 22% para servicios gravados
export const IVA_RATE = 22

export function formatCurrency(amount: number, currency: CurrencyType): string {
  if (currency === 'UYU') {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateTax(subtotal: number, currency: CurrencyType, taxRate?: number): {
  taxAmount: number
  total: number
  effectiveRate: number
} {
  // IVA 22% only for UYU invoices (Uruguayan services)
  const rate = taxRate ?? (currency === 'UYU' ? IVA_RATE : 0)
  const taxAmount = Math.round(subtotal * (rate / 100) * 100) / 100
  return {
    taxAmount,
    total: Math.round((subtotal + taxAmount) * 100) / 100,
    effectiveRate: rate,
  }
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  currency: CurrencyType,
  taxRate?: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const rounded = Math.round(subtotal * 100) / 100
  const { taxAmount, total, effectiveRate } = calculateTax(rounded, currency, taxRate)

  return {
    subtotal: rounded,
    tax_rate: effectiveRate,
    tax_amount: taxAmount,
    total,
  }
}
