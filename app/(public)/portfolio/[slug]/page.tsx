import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('portfolio_items')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Portfolio' }
  return { title: data.title, description: data.description ?? undefined }
}

const FALLBACK_ITEMS: Record<string, {
  title: string; description: string; long_description: string
  tags: string[]; url: string
}> = {
  worldcaseuy: {
    title: 'World Case UY',
    description: 'Tienda online de accesorios para celulares en Uruguay.',
    long_description: 'Desarrollamos una tienda online moderna para World Case UY, especializada en fundas y accesorios para smartphones. El proyecto incluyó diseño UX/UI desde cero, catálogo dinámico de productos, carrito de compras y pasarela de pago integrada con MercadoPago. El resultado fue un aumento del 40% en ventas online.',
    tags: ['ecommerce', 'ux/ui', 'mercadopago', 'next.js'],
    url: 'https://www.worldcaseuy.com',
  },
  contaminauy: {
    title: 'Contamina UY',
    description: 'Plataforma ambiental para Uruguay.',
    long_description: 'Sitio web para organización que monitorea y denuncia la contaminación en Uruguay. Incluye mapa interactivo de puntos de contaminación, formulario de denuncias ciudadanas, blog de concientización y panel de estadísticas públicas.',
    tags: ['web', 'social', 'mapas', 'next.js'],
    url: 'https://www.contaminauy.com',
  },
  menteweb: {
    title: 'Mente Web',
    description: 'Plataforma de bienestar mental.',
    long_description: 'Plataforma digital de bienestar mental y meditación para el mercado uruguayo. Desarrollamos un sistema de artículos con categorías, comunidad de usuarios con foros moderados, recursos descargables y newsletter. La plataforma alcanzó 500+ usuarios en el primer mes.',
    tags: ['web app', 'bienestar', 'comunidad', 'next.js'],
    url: 'https://www.menteweb.com',
  },
  brillomagicouy: {
    title: 'Brillo Mágico UY',
    description: 'Landing y sistema de turnos para empresa de limpieza.',
    long_description: 'Landing page profesional para empresa de servicios de limpieza del hogar en Uruguay. Incluye presentación de servicios, galería de trabajos, formulario de cotización online y sistema de agenda de turnos.',
    tags: ['landing', 'servicios', 'reservas', 'next.js'],
    url: 'https://www.brillomagicouy.com',
  },
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  const item = data ?? FALLBACK_ITEMS[slug]
  if (!item) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button asChild variant="ghost" className="mb-8 -ml-3 gap-2 text-gray-500">
        <Link href="/portfolio">
          <ArrowLeft className="h-4 w-4" />
          Volver al portfolio
        </Link>
      </Button>

      {/* Cover */}
      <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-8">
        {'cover_image' in item && item.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_image as string} alt={item.title} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <p className="text-6xl font-bold text-gray-300 uppercase">{item.title.charAt(0)}</p>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
        {item.url && (
          <Button asChild variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Ver sitio <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>

      {/* Tags */}
      {'tags' in item && Array.isArray(item.tags) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(item.tags as string[]).map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed text-lg">
          {('long_description' in item && item.long_description) || item.description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-gray-950 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">¿Querés algo similar?</h2>
        <p className="text-gray-400 mb-6">Hablemos sobre tu proyecto y te hacemos una propuesta.</p>
        <Button asChild>
          <Link href="/contacto">Hablemos</Link>
        </Button>
      </div>
    </div>
  )
}
