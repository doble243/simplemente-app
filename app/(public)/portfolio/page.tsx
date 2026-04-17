import type { Metadata } from 'next'
import { PortfolioShowcase } from '@/components/public/PortfolioShowcase'

export const metadata: Metadata = {
  title: 'Portfolio · Simplemente',
  description: 'Proyectos reales construidos para vender y automatizar negocios en Uruguay.',
}

export default function PortfolioPage() {
  return <PortfolioShowcase />
}
