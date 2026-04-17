'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Project {
  id:          string
  slug:        string
  eyebrow:     string
  name:        string
  description: string
  url:         string | null
  screenshot:  string | null
  /** CSS gradient string — always rendered, looks intentional */
  gradient:    string
  accent:      string
  theme:       'dark' | 'light'
  tags:        string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────
function thumbUrl(url: string) {
  return `https://image.thum.io/get/width/1200/crop/700/noanimate/${url}`
}

export const PORTFOLIO_PROJECTS: Project[] = [
  {
    id:          'contaminauy',
    slug:        'contaminauy',
    eyebrow:     'Ropa Urbana · Tienda Online',
    name:        'Contamina UY',
    description: 'Tienda de ropa urbana con catálogo, carrito y MercadoPago. Construida para vender desde el primer día.',
    url:         'https://www.contaminauy.com',
    screenshot:  thumbUrl('https://contaminauy.com'),
    gradient:    'radial-gradient(ellipse at 70% 25%, rgba(201,169,110,0.55) 0%, rgba(160,90,30,0.25) 45%, transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(120,60,20,0.3) 0%, transparent 55%)',
    accent:      '#c9a96e',
    theme:       'dark',
    tags:        ['Tienda online', 'MercadoPago', 'Next.js'],
  },
  {
    id:          'worldcaseuy',
    slug:        'worldcaseuy',
    eyebrow:     'Accesorios · Ecommerce',
    name:        'WorldCase UY',
    description: 'Fundas personalizadas y accesorios para celulares. Catálogo dinámico y pagos integrados.',
    url:         'https://www.worldcaseuy.com',
    screenshot:  thumbUrl('https://worldcaseuy.com'),
    gradient:    'radial-gradient(ellipse at 65% 30%, rgba(108,99,255,0.55) 0%, rgba(80,60,200,0.2) 45%, transparent 70%), radial-gradient(ellipse at 25% 75%, rgba(168,85,247,0.3) 0%, transparent 50%)',
    accent:      '#6c63ff',
    theme:       'light',
    tags:        ['Ecommerce', 'Personalización', 'Next.js'],
  },
  {
    id:          'menteweb',
    slug:        'menteweb',
    eyebrow:     'Productos Digitales · Plataforma',
    name:        'MenteWeb',
    description: 'Plataforma de productos digitales y bienestar. Comunidad, artículos y recursos descargables.',
    url:         'https://www.menteweb.com',
    screenshot:  thumbUrl('https://menteweb.com'),
    gradient:    'radial-gradient(ellipse at 60% 25%, rgba(167,139,250,0.55) 0%, rgba(139,92,246,0.25) 40%, transparent 65%), radial-gradient(ellipse at 30% 70%, rgba(196,181,253,0.2) 0%, transparent 55%)',
    accent:      '#a78bfa',
    theme:       'dark',
    tags:        ['Web App', 'Comunidad', 'Next.js'],
  },
  {
    id:          'candalez',
    slug:        'candalez',
    eyebrow:     'Perfumería Árabe · Branding',
    name:        'Candalez',
    description: 'Presencia digital de lujo para perfumería árabe. Diseño editorial, identidad visual premium.',
    url:         null,
    screenshot:  null,
    gradient:    'radial-gradient(ellipse at 60% 20%, rgba(212,165,116,0.6) 0%, rgba(170,110,60,0.3) 40%, transparent 65%), radial-gradient(ellipse at 25% 80%, rgba(180,130,80,0.25) 0%, transparent 50%)',
    accent:      '#d4a574',
    theme:       'light',
    tags:        ['Landing', 'Branding', 'Next.js'],
  },
  {
    id:          'brillomagicouy',
    slug:        'brillomagicouy',
    eyebrow:     'Bienestar Holístico · Turnos',
    name:        'Brillo Mágico UY',
    description: 'Landing y sistema de agenda online para servicio de limpieza y bienestar del hogar.',
    url:         'https://www.brillomagicouy.com',
    screenshot:  thumbUrl('https://brillomagicouy.com'),
    gradient:    'radial-gradient(ellipse at 55% 25%, rgba(74,222,128,0.5) 0%, rgba(34,197,94,0.2) 45%, transparent 65%), radial-gradient(ellipse at 20% 75%, rgba(16,185,129,0.25) 0%, transparent 55%)',
    accent:      '#4ade80',
    theme:       'dark',
    tags:        ['Landing', 'Reservas', 'Next.js'],
  },
]

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref           = useRef<HTMLElement>(null)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasEntered(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, hasEntered }
}

// ─── Magnetic button hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength })
  }, [strength])

  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), [])
  return { ref, pos, onMove, onLeave }
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] opacity-[0.022]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  )
}

// ─── Nav dots ─────────────────────────────────────────────────────────────────
function NavDots({ total, current, onNavigate }: {
  total: number; current: number; onNavigate: (i: number) => void
}) {
  return (
    <div className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          aria-label={`Sección ${i + 1}`}
          className="flex items-center justify-end gap-2.5 group"
        >
          <span
            className="text-[10px] font-medium uppercase tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {i === 0 ? 'Inicio' : PORTFOLIO_PROJECTS[i - 1]?.name}
          </span>
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width:      i === current ? '22px' : '6px',
              height:     '6px',
              background: i === current ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
            }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Project Section ──────────────────────────────────────────────────────────
function ProjectSection({ project, index, onVisible }: {
  project: Project; index: number; onVisible: (i: number) => void
}) {
  const sectionRef    = useRef<HTMLElement>(null)
  const imageRef      = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [imgOk, setImgOk]     = useState(true)
  const mag = useMagnetic(0.28)

  const isDark   = project.theme === 'dark'
  const bg       = isDark ? '#060a1c' : '#faf9f7'
  const fg       = isDark ? '#f8f8f8' : '#1a1a1a'
  const fgMuted  = isDark ? 'rgba(248,248,248,0.45)' : 'rgba(26,26,26,0.45)'
  const fgDim    = isDark ? 'rgba(248,248,248,0.12)' : 'rgba(26,26,26,0.10)'
  const tagBg    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const tagColor = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.40)'

  // IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          onVisible(index + 1)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index, onVisible])

  // Parallax on background
  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return
      const rect = imageRef.current.getBoundingClientRect()
      const dist = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
      imageRef.current.style.transform = `translateY(${dist * -20}px) scale(1.07)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const show = (delay: number) => ({
    opacity:   entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
  })

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      data-section-index={index + 1}
      className="relative flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden"
      style={{ background: bg }}
    >
      {/* Brand gradient — always visible */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[1200ms]"
        style={{ background: project.gradient, opacity: entered ? 1 : 0.3 }}
      />

      {/* Screenshot overlay — only if loaded */}
      {project.screenshot && imgOk && (
        <div
          ref={imageRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-[1500ms]"
          style={{ opacity: entered ? 0.11 : 0, transform: 'scale(1.07)', transitionDelay: '400ms' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.screenshot}
            alt=""
            aria-hidden
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? `linear-gradient(to bottom, ${bg}bb 0%, ${bg}22 35%, ${bg}dd 100%)`
                : `linear-gradient(to bottom, ${bg}cc 0%, ${bg}33 35%, ${bg}ee 100%)`,
            }}
          />
        </div>
      )}

      {/* Accent top line */}
      <div
        className="absolute top-0 left-10 h-[1px]"
        style={{
          width:           entered ? '40px' : '0px',
          background:      project.accent,
          opacity:         0.55,
          transition:      'width 0.9s ease 500ms',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 px-8 py-28 lg:px-16"
        style={{ paddingTop: 'max(112px, env(safe-area-inset-top, 112px))' }}
      >
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em]"
          style={{ ...show(80), color: project.accent, opacity: entered ? 0.9 : 0 }}>
          {project.eyebrow}
        </p>

        <h2
          className="mb-5 font-light leading-[1.02] tracking-tight"
          style={{ ...show(200), fontSize: 'clamp(40px, 9vw, 82px)', color: fg }}
        >
          {project.name}
        </h2>

        <p
          className="mb-8 max-w-sm text-[15px] leading-relaxed"
          style={{ ...show(340), color: fgMuted }}
        >
          {project.description}
        </p>

        <div className="mb-10 flex flex-wrap gap-2" style={show(440)}>
          {project.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
              style={{ background: tagBg, color: tagColor }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Magnetic CTA */}
        <div style={show(520)}>
          {project.url ? (
            <a
              ref={mag.ref}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseMove={mag.onMove}
              onMouseLeave={mag.onLeave}
              className="group inline-flex items-center gap-2 text-[14px] font-medium"
              style={{
                color:     project.accent,
                transform: `translate(${mag.pos.x}px, ${mag.pos.y}px)`,
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), color 0.2s ease',
                display: 'inline-flex',
              }}
            >
              Ver sitio en vivo
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          ) : (
            <span className="text-[13px] font-medium uppercase tracking-widest"
              style={{ color: fgMuted }}>
              Próximamente
            </span>
          )}
        </div>
      </div>

      {/* Section counter */}
      <div className="absolute bottom-8 right-8 z-10">
        <span className="text-[12px] font-light tracking-widest tabular-nums"
          style={{ color: fgDim }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onVisible }: { onVisible: (i: number) => void }) {
  const [loaded, setLoaded]     = useState(false)
  const [mouse, setMouse]       = useState({ x: 0, y: 0 })
  const containerRef            = useRef<HTMLElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    const el = containerRef.current
    if (!el) return () => clearTimeout(t)
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(0) },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => { clearTimeout(t); obs.disconnect() }
  }, [onVisible])

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: (e.clientX - rect.left) / rect.width  - 0.5,
      y: (e.clientY - rect.top)  / rect.height - 0.5,
    })
  }

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      data-section-index={0}
      className="relative flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden"
      style={{ background: '#060a1c' }}
      onMouseMove={onMouseMove}
    >
      {/* Parallax orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute rounded-full"
          style={{
            top: '-10%', right: '-5%', width: '60%', height: '60%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)',
            transform:  `translate(${mouse.x * -40}px, ${mouse.y * -30}px)`,
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        <div className="absolute rounded-full"
          style={{
            bottom: '5%', left: '-5%', width: '45%', height: '45%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)',
            transform:  `translate(${mouse.x * 30}px, ${mouse.y * 20}px)`,
            transition: 'transform 1s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>

      <div className="relative z-10 px-8 py-24 lg:px-16"
        style={{ paddingTop: 'max(120px, env(safe-area-inset-top, 120px))' }}>

        <div className="mb-8" style={{
          opacity:   loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease 100ms, transform 0.7s ease 100ms',
        }}>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/35">
            Trabajo Real
          </span>
          <div className="mt-3 h-[1px] bg-white/12"
            style={{ width: loaded ? '40px' : '0px', transition: 'width 0.7s ease 400ms' }}
          />
        </div>

        <h1 className="mb-6 font-light leading-[1.02] tracking-tight text-white"
          style={{
            fontSize:   'clamp(48px, 10vw, 92px)',
            opacity:    loaded ? 1 : 0,
            transform:  loaded ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.85s ease 200ms, transform 0.85s ease 200ms',
          }}>
          Proyectos que<br />
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>generan resultados</span>
        </h1>

        <p className="mb-12 max-w-xs text-[15px] leading-relaxed text-white/35"
          style={{
            opacity:    loaded ? 1 : 0,
            transform:  loaded ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease 370ms, transform 0.7s ease 370ms',
          }}>
          Construidos para el mercado uruguayo. Cada uno pensado para vender o automatizar un negocio real.
        </p>

        <div style={{
          opacity:    loaded ? 1 : 0,
          transition: 'opacity 0.6s ease 700ms',
        }}>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">Scroll</span>
          <div className="mt-2 h-8 w-[1px] bg-white/15"
            style={{ animation: 'float 2.2s ease-in-out infinite' }} />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10">
        <span className="text-[12px] font-light tracking-widest text-white/8">00</span>
      </div>

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection({ index }: { index: number }) {
  const { ref, hasEntered } = useInView(0.3)
  const mag = useMagnetic(0.3)

  const show = (delay: number) => ({
    opacity:    hasEntered ? 1 : 0,
    transform:  hasEntered ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
  })

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      data-section-index={index}
      className="relative flex min-h-[80dvh] w-full flex-col items-center justify-center overflow-hidden text-center"
      style={{ background: '#faf9f7' }}
    >
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(201,169,110,0.10) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 px-8">
        <div className="mb-8 flex flex-col items-center" style={show(100)}>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-black/30">
            Tu proyecto es el siguiente
          </span>
          <div className="mt-3 h-[1px] bg-black/10"
            style={{ width: hasEntered ? '40px' : '0px', transition: 'width 0.9s ease 450ms' }}
          />
        </div>

        <h2
          className="mb-6 font-light leading-[1.02] tracking-tight text-[#1a1a1a]"
          style={{ ...show(220), fontSize: 'clamp(38px, 8vw, 72px)' }}
        >
          Empezá a<br />
          <span style={{ color: 'rgba(26,26,26,0.38)' }}>construir el tuyo</span>
        </h2>

        <p className="mb-10 text-[15px] leading-relaxed text-black/38"
          style={show(360)}>
          Nos escribís, vemos tu idea y armamos algo concreto.
        </p>

        <div style={show(480)}>
          <Link
            ref={mag.ref}
            href="/contacto"
            onMouseMove={mag.onMove}
            onMouseLeave={mag.onLeave}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#1a1a1a] px-7 py-3.5 text-[14px] font-medium text-white"
            style={{
              transform:  `translate(${mag.pos.x}px, ${mag.pos.y}px)`,
              transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), background 0.2s ease',
              boxShadow:  '0 20px 50px rgba(0,0,0,0.12)',
            }}
          >
            Hablemos
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PortfolioShowcase() {
  const [currentSection, setCurrentSection] = useState(0)

  const navigateTo = useCallback((i: number) => {
    const el = document.querySelector(`[data-section-index="${i}"]`) as HTMLElement
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="relative">
      <GrainOverlay />
      <NavDots
        total={PORTFOLIO_PROJECTS.length + 1}
        current={currentSection}
        onNavigate={navigateTo}
      />
      <HeroSection onVisible={setCurrentSection} />
      {PORTFOLIO_PROJECTS.map((p, i) => (
        <ProjectSection key={p.id} project={p} index={i} onVisible={setCurrentSection} />
      ))}
      <CTASection index={PORTFOLIO_PROJECTS.length + 1} />
    </div>
  )
}
