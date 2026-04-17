import type { Metadata } from 'next'
import { NosotrosShowcase } from '@/components/public/NosotrosShowcase'

export const metadata: Metadata = {
  title: 'Nosotros · Simplemente',
  description: 'Somos una agencia web uruguaya que usa IA para crear páginas, tiendas y sistemas que realmente funcionen.',
}

export default function NosotrosPage() {
  return <NosotrosShowcase />
}
