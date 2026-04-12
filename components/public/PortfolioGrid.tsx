'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { PortfolioItem } from '@/types/database'

interface PortfolioGridProps {
  items: PortfolioItem[]
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            id: '1', slug: 'worldcaseuy', title: 'World Case UY',
            description: 'Tienda online de accesorios para celulares en Uruguay.',
            tags: ['ecommerce', 'mercadopago'], url: 'https://www.worldcaseuy.com',
            cover_image: null, featured: true,
          },
          {
            id: '2', slug: 'contaminauy', title: 'Contamina UY',
            description: 'Plataforma ambiental para Uruguay.',
            tags: ['web', 'social'], url: 'https://www.contaminauy.com',
            cover_image: null, featured: false,
          },
          {
            id: '3', slug: 'menteweb', title: 'Mente Web',
            description: 'Plataforma de bienestar mental.',
            tags: ['web app', 'comunidad'], url: 'https://www.menteweb.com',
            cover_image: null, featured: true,
          },
          {
            id: '4', slug: 'brillomagicouy', title: 'Brillo Mágico UY',
            description: 'Landing y sistema de turnos para limpieza del hogar.',
            tags: ['landing', 'reservas'], url: 'https://www.brillomagicouy.com',
            cover_image: null, featured: false,
          },
        ] as PortfolioItem[]

  /* One accent gradient per card */
  const glows = [
    'from-primary/30 via-violet-600/15 to-transparent',
    'from-indigo-500/25 via-primary/10 to-transparent',
    'from-violet-500/25 via-indigo-600/10 to-transparent',
    'from-primary/20 via-violet-500/15 to-transparent',
  ]

  return (
    <section className="relative overflow-hidden bg-[#020D18] py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Nuestro trabajo
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Portfolio</h2>
            <p className="mt-2 text-white/50">Proyectos reales, resultados reales.</p>
          </div>
          <Link
            href="/portfolio"
            className="group hidden items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white sm:flex"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {displayItems.map((item, i) => (
            <div
              key={item.id}
              className="group relative cursor-pointer"
              onClick={() => { window.location.href = `/portfolio/${item.slug}` }}
            >
              {/* Gradient border on hover */}
              <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${glows[i % glows.length]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A1628] transition-colors duration-300 group-hover:border-transparent">

                {/* Cover image / placeholder */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {item.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${glows[i % glows.length]} bg-[#0d1b2a]`}>
                      <span className="text-6xl font-black uppercase tracking-widest text-white/[0.06]">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#020D18]/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="p-5 pb-4">
                      <p className="text-xs font-medium uppercase tracking-widest text-primary">
                        Ver proyecto
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-3 p-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-white/40">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 rounded-lg border border-white/[0.08] p-2 text-white/40 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.08] hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-6 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-primary/30 hover:text-white"
          >
            Ver todos los proyectos
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  )
}
