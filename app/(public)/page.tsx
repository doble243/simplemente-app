import type { Metadata } from 'next'
import { Hero } from '@/components/public/Hero'
import { ServicesGrid } from '@/components/public/ServicesGrid'
import { ShowreelSection } from '@/components/public/ShowreelSection'
import { PortfolioGrid } from '@/components/public/PortfolioGrid'
import { ContactForm } from '@/components/public/ContactForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Simplemente — Agencia Web con IA para Uruguay',
}

export const revalidate = 3600

async function getPortfolioItems() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .limit(4)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const portfolioItems = await getPortfolioItems()

  return (
    <>
      <Hero />
      <ServicesGrid />
      <ShowreelSection />
      <PortfolioGrid items={portfolioItems} />
      <ContactForm />
    </>
  )
}
