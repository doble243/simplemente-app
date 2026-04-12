import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://simplemente.uy'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/servicios`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/nosotros`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portfolio_items')
      .select('slug, updated_at')
      .eq('published', true)

    const portfolioRoutes: MetadataRoute.Sitemap = (data ?? []).map((item) => ({
      url: `${base}/portfolio/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...portfolioRoutes]
  } catch {
    return staticRoutes
  }
}
