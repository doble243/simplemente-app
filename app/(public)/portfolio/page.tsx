import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { PortfolioItem } from '@/types/database'

export const metadata: Metadata = { title: 'Portfolio' }
export const dynamic = 'force-dynamic'

const FALLBACK: PortfolioItem[] = [
  {
    id: '1', slug: 'worldcaseuy', title: 'World Case UY',
    description: 'Tienda online de accesorios para celulares en Uruguay.',
    long_description: null, tags: ['ecommerce', 'mercadopago'],
    url: 'https://www.worldcaseuy.com', cover_image: null,
    gallery: [], featured: true, sort_order: 1, published: true,
    project_id: null, created_at: '', updated_at: '',
  },
  {
    id: '2', slug: 'contaminauy', title: 'Contamina UY',
    description: 'Plataforma ambiental para Uruguay.',
    long_description: null, tags: ['web', 'social'],
    url: 'https://www.contaminauy.com', cover_image: null,
    gallery: [], featured: false, sort_order: 2, published: true,
    project_id: null, created_at: '', updated_at: '',
  },
  {
    id: '3', slug: 'menteweb', title: 'Mente Web',
    description: 'Plataforma de bienestar mental.',
    long_description: null, tags: ['web app', 'comunidad'],
    url: 'https://www.menteweb.com', cover_image: null,
    gallery: [], featured: true, sort_order: 3, published: true,
    project_id: null, created_at: '', updated_at: '',
  },
  {
    id: '4', slug: 'brillomagicouy', title: 'Brillo Mágico UY',
    description: 'Landing y sistema de turnos para limpieza del hogar.',
    long_description: null, tags: ['landing', 'reservas'],
    url: 'https://www.brillomagicouy.com', cover_image: null,
    gallery: [], featured: false, sort_order: 4, published: true,
    project_id: null, created_at: '', updated_at: '',
  },
]

const gradients = [
  'from-primary/20 via-primary/10 to-accent',
  'from-accent via-primary/5 to-secondary',
  'from-primary/15 via-secondary to-primary/5',
  'from-secondary via-accent to-primary/10',
]

async function getItems(): Promise<PortfolioItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('published', true)
      .order('sort_order')
    return (data ?? []).length > 0 ? (data as PortfolioItem[]) : FALLBACK
  } catch {
    return FALLBACK
  }
}

export default async function PortfolioPage() {
  const items = await getItems()

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mb-14">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Nuestro trabajo
        </p>
        <h1 className="mb-3 text-4xl font-bold text-foreground">Portfolio</h1>
        <p className="max-w-xl text-muted-foreground">
          Proyectos reales para el mercado uruguayo. Cada uno construido con tecnología moderna e inteligencia artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
          >
            <Link href={`/portfolio/${item.slug}`} className="absolute inset-0 z-0" aria-label={item.title} />

            <div className={`aspect-video bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
              {item.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl font-black uppercase text-primary/25 tracking-widest">{item.title.charAt(0)}</span>
              )}
            </div>
            <div className="relative p-6">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h2>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
