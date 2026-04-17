'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { PORTFOLIO_PROJECTS } from '@/components/public/PortfolioShowcase'
import type { Project } from '@/components/public/PortfolioShowcase'
import type { PortfolioItem } from '@/types/database'

interface PortfolioGridProps {
  items: PortfolioItem[]
}

interface Slide extends Project {
  /* nothing extra needed */
}

function buildSlides(items: PortfolioItem[]): Slide[] {
  if (items.length === 0) return PORTFOLIO_PROJECTS
  return items.map((item) => {
    const match = PORTFOLIO_PROJECTS.find((p) => p.slug === item.slug)
    if (match) return { ...match, name: item.title, description: item.description ?? match.description, url: item.url ?? match.url }
    return {
      id: item.id, slug: item.slug,
      eyebrow: (item.tags ?? []).slice(0, 3).join(' · '),
      name: item.title,
      description: item.description ?? '',
      url: item.url, screenshot: item.cover_image,
      gradient: 'radial-gradient(ellipse at 60% 25%, rgba(255,255,255,0.06) 0%, transparent 60%)',
      accent: '#a0a8b0', theme: 'dark' as const, tags: item.tags ?? [],
    }
  })
}

// ─── Single project card ──────────────────────────────────────────────────────
function ProjectCard({ slide }: { slide: Slide }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <Link
      href={`/portfolio/${slide.slug}`}
      className="group relative flex-shrink-0 overflow-hidden rounded-2xl"
      style={{
        width: 'clamp(260px, 72vw, 320px)',
        scrollSnapAlign: 'start',
        border: '1px solid rgba(255,255,255,0.07)',
        background: '#0a1628',
      }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: slide.gradient, opacity: 0.75 }}
      />

      {/* Screenshot */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {slide.screenshot && imgOk ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.screenshot}
              alt={slide.name}
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #0a1628 100%)' }} />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: slide.gradient }}>
            <span className="text-7xl font-black uppercase" style={{ color: `${slide.accent}18` }}>
              {slide.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-white"
            style={{ background: slide.accent, backdropFilter: 'blur(8px)' }}
          >
            Ver proyecto
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="relative z-10 p-5">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: slide.accent }}>
          {slide.eyebrow}
        </p>
        <h3 className="mb-2 text-[17px] font-semibold leading-tight text-white">{slide.name}</h3>
        <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {slide.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {slide.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              style={{ background: `${slide.accent}14`, color: slide.accent, border: `1px solid ${slide.accent}25` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Accent bottom line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, ${slide.accent}, transparent)` }}
      />
    </Link>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PortfolioGrid({ items }: PortfolioGridProps) {
  const slides  = buildSlides(items)
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollBy(dir: 'left' | 'right') {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-[#020D18] py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nuestro trabajo</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Portfolio
              {slides.length > 0 && (
                <span className="ml-3 inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold align-middle"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                  {slides.length}
                </span>
              )}
            </h2>
            <p className="mt-2 text-white/50">Proyectos reales, resultados reales.</p>
          </div>

          {/* Arrow controls — desktop */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scrollBy('left')}
              aria-label="Anterior"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              aria-label="Siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              href="/portfolio"
              className="group ml-2 flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-[#020D18] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#020D18] to-transparent" />

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              paddingLeft:  'max(24px, calc((100vw - 1152px) / 2 + 24px))',
              paddingRight: 'max(80px, calc((100vw - 1152px) / 2 + 80px))',
            }}
          >
            {slides.map((slide) => (
              <ProjectCard key={slide.id} slide={slide} />
            ))}
          </div>
        </div>

        {/* Mobile "Ver todos" */}
        <div className="mt-6 text-center sm:hidden">
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
