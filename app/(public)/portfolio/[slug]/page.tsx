import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PORTFOLIO_PROJECTS } from '@/components/public/PortfolioShowcase'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = PORTFOLIO_PROJECTS.find(p => p.id === slug)
  if (!project) return { title: 'Portfolio · Simplemente' }
  return {
    title: `${project.name} · Portfolio · Simplemente`,
    description: project.description,
  }
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params

  // Try DB first, fallback to static data
  let dbItem: { long_description?: string | null; tags?: string[] } | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portfolio_items')
      .select('long_description, tags')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    dbItem = data
  } catch { /* ignore */ }

  const project = PORTFOLIO_PROJECTS.find(p => p.id === slug)
  if (!project) notFound()

  const longDesc = dbItem?.long_description ?? null
  const tags     = dbItem?.tags ?? project.tags
  const isDark   = project.theme === 'dark'

  const bg      = isDark ? '#060a1c' : '#faf9f7'
  const fg      = isDark ? '#f8f8f8' : '#1a1a1a'
  const fgMuted = isDark ? 'rgba(248,248,248,0.45)' : 'rgba(26,26,26,0.45)'
  const tagBg   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const tagClr  = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.45)'

  return (
    <div className="relative min-h-screen" style={{ background: bg, color: fg }}>

      {/* Background screenshot */}
      {project.screenshot && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0.10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.screenshot}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? `linear-gradient(to bottom, ${bg}aa 0%, transparent 30%, ${bg} 80%)`
                : `linear-gradient(to bottom, ${bg}bb 0%, transparent 30%, ${bg} 80%)`,
            }}
          />
        </div>
      )}

      {/* Gradient orb for no-screenshot */}
      {!project.screenshot && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 70% 20%, ${project.accent}18 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Accent top line */}
      <div
        className="absolute top-0 left-12 h-[1px]"
        style={{ width: '40px', background: project.accent, opacity: 0.5 }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-8 py-24 lg:px-12">

        {/* Back */}
        <Link
          href="/portfolio"
          className="group mb-16 inline-flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: fgMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Portfolio
        </Link>

        {/* Eyebrow */}
        <p
          className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em]"
          style={{ color: project.accent, opacity: 0.9 }}
        >
          {project.eyebrow}
        </p>

        {/* Title */}
        <h1
          className="mb-6 font-light leading-[1.02] tracking-tight"
          style={{ fontSize: 'clamp(40px, 8vw, 68px)', color: fg }}
        >
          {project.name}
        </h1>

        {/* Description */}
        <p
          className="mb-8 max-w-md text-[16px] leading-relaxed"
          style={{ color: fgMuted }}
        >
          {longDesc ?? project.description}
        </p>

        {/* Tags */}
        <div className="mb-10 flex flex-wrap gap-2">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
              style={{ background: tagBg, color: tagClr }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border px-7 py-3.5 text-[14px] font-medium transition-all duration-300"
            style={{
              borderColor: `${project.accent}40`,
              color:        project.accent,
              background:   `${project.accent}0a`,
            }}
          >
            Ver sitio en vivo
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}

        {/* Divider */}
        <div
          className="my-16 h-[1px]"
          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
        />

        {/* Bottom CTA */}
        <div>
          <p
            className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em]"
            style={{ color: fgMuted }}
          >
            ¿Querés algo así?
          </p>
          <h2
            className="mb-6 text-[28px] font-light tracking-tight"
            style={{ color: fg }}
          >
            Hablemos de tu proyecto
          </h2>
          <Link
            href="/contacto"
            className="group inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-[14px] font-medium transition-all duration-300"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
              color:        fg,
            }}
          >
            Empezar
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}
