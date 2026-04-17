'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ─── Slide data ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 0,
    eyebrow: 'AGENCIA DIGITAL · URUGUAY',
    line1: 'Tu negocio',
    line2: 'en internet,',
    accent: 'simplemente.',
    body: 'Páginas web y sistemas completos, creados con inteligencia artificial. Rápido, moderno y a precio accesible para el mercado uruguayo.',
    cta: { label: 'Quiero mi proyecto', href: '/contacto' },
    ghost: { label: 'Ver portfolio', href: '/portfolio' },
    hex: '#6c63ff',
    r: 108, g: 99, b: 255,
    card: {
      eyebrow: 'Simplemente Studio',
      stats: [
        { val: '4+',  label: 'Proyectos activos' },
        { val: 'IA',  label: 'En cada entrega' },
        { val: '🇺🇾', label: 'Mercado local' },
      ],
      bars: [35, 55, 42, 70, 58, 82, 68, 95],
    },
  },
  {
    id: 1,
    eyebrow: 'SERVICIO · LANDING PAGE',
    line1: 'La primera',
    line2: 'impresión',
    accent: 'que convierte.',
    body: 'Diseño moderno y velocidad extrema. Tu landing page lista en días. Desde $5.000 UYU.',
    cta: { label: 'Pedir presupuesto', href: '/contacto' },
    ghost: { label: 'Ver ejemplos', href: '/portfolio' },
    hex: '#06b6d4',
    r: 6, g: 182, b: 212,
    card: {
      eyebrow: 'Landing Page',
      stats: [
        { val: '7d',    label: 'Entrega promedio' },
        { val: '+180%', label: 'Conversión media' },
        { val: '100',   label: 'PageSpeed score' },
      ],
      bars: [40, 60, 48, 75, 62, 85, 72, 98],
    },
  },
  {
    id: 2,
    eyebrow: 'SERVICIO · E-COMMERCE',
    line1: 'Vendé',
    line2: 'sin límites,',
    accent: '24/7.',
    body: 'Tienda online completa con catálogo, carrito y MercadoPago integrado. Desde $20.000 UYU.',
    cta: { label: 'Crear mi tienda', href: '/contacto' },
    ghost: { label: 'Cómo funciona', href: '/servicios' },
    hex: '#a855f7',
    r: 168, g: 85, b: 247,
    card: {
      eyebrow: 'Tienda Online',
      stats: [
        { val: '24/7',  label: 'Ventas automáticas' },
        { val: '✓',     label: 'MercadoPago UY' },
        { val: '+340%', label: 'ROI promedio' },
      ],
      bars: [30, 50, 38, 65, 52, 78, 62, 90],
    },
  },
  {
    id: 3,
    eyebrow: 'PAQUETE COMPLETO ⭐',
    line1: 'Web + sistema',
    line2: 'completo por',
    accent: '$20.000 UYU.',
    body: 'Página + sistema de gestión. $8.000 UYU/mes incluye mejoras continuas y creación de contenido.',
    cta: { label: 'Ver el paquete', href: '/contacto' },
    ghost: { label: 'Más información', href: '/servicios' },
    hex: '#22c55e',
    r: 34, g: 197, b: 94,
    card: {
      eyebrow: 'Paquete Completo',
      stats: [
        { val: '$20K',   label: 'Entrada única' },
        { val: '$8K/mes',label: 'Mantenimiento' },
        { val: '∞',      label: 'Mejoras incluidas' },
      ],
      bars: [45, 62, 50, 72, 60, 80, 70, 92],
    },
  },
] as const

type Slide = (typeof SLIDES)[number]
const DURATION = 5600

// ─── Main component ───────────────────────────────────────────────────────────

export function Hero() {
  const [idx, setIdx]         = useState(0)
  const [progress, setProg]   = useState(0)
  const [mouse, setMouse]     = useState({ x: 0, y: 0 })
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)
  const progRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const slide                 = SLIDES[idx]

  // ── Auto-rotate + progress ──
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (progRef.current)  clearInterval(progRef.current)
    setProg(0)

    const step = 60
    progRef.current = setInterval(() => {
      setProg(p => Math.min(100, p + (step / DURATION) * 100))
    }, step)

    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % SLIDES.length)
      setProg(0)
    }, DURATION)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (progRef.current)  clearInterval(progRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Mouse parallax ──
  useEffect(() => {
    function onMove(e: MouseEvent) {
      setMouse({
        x: (e.clientX / window.innerWidth)  - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function goTo(i: number) {
    setIdx(i)
    startTimer()
  }

  const orbX   = mouse.x * -50
  const orbY   = mouse.y * -50
  const cardX  = mouse.x * 14
  const cardY  = mouse.y * 10
  const tiltX  = mouse.y * -7
  const tiltY  = mouse.x * 7

  return (
    <section className="relative h-screen overflow-hidden bg-[#020D18]">

      {/* ── Primary orb ── */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left:       `calc(62% + ${orbX}px)`,
          top:        `calc(38% + ${orbY}px)`,
          width:      700,
          height:     700,
          transform:  'translate(-50%, -50%)',
          background: `radial-gradient(circle, rgba(${slide.r},${slide.g},${slide.b},0.20) 0%, transparent 70%)`,
          filter:     'blur(55px)',
          transition: 'background 900ms ease, left 200ms ease, top 200ms ease',
        }}
      />
      {/* ── Secondary orb ── */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left:       `calc(18% + ${-orbX * 0.5}px)`,
          top:        `calc(72% + ${-orbY * 0.5}px)`,
          width:      440,
          height:     440,
          transform:  'translate(-50%, -50%)',
          background: `radial-gradient(circle, rgba(${slide.r},${slide.g},${slide.b},0.09) 0%, transparent 70%)`,
          filter:     'blur(80px)',
          transition: 'background 900ms ease',
        }}
      />

      {/* ── Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform:      `translate(${mouse.x * 10}px, ${mouse.y * 10}px)`,
          transition:     'transform 250ms ease',
        }}
      />

      {/* ── Vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020D18]/60 via-transparent to-[#020D18]/80" />

      {/* ── Slides ── */}
      {SLIDES.map((s, i) => (
        <SlideContent
          key={s.id}
          slide={s}
          active={i === idx}
          cardX={cardX}
          cardY={cardY}
          tiltX={tiltX}
          tiltY={tiltY}
        />
      ))}

      {/* ── Dot navigation ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="relative flex items-center justify-center py-1"
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width:           i === idx ? 30 : 6,
                height:          6,
                backgroundColor: i === idx
                  ? slide.hex
                  : 'rgba(255,255,255,0.18)',
              }}
            />
          </button>
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-9 right-6 lg:right-10 flex items-center gap-1.5 z-20">
        <span
          className="text-[13px] font-black tabular-nums"
          style={{ color: slide.hex, transition: 'color 700ms ease' }}
        >
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span className="text-white/20 text-[11px]">/</span>
        <span className="text-white/20 text-[11px] tabular-nums">
          {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/[0.04] z-20">
        <div
          className="h-full"
          style={{
            width:      `${progress}%`,
            background: slide.hex,
            opacity:    0.55,
            transition: progress < 2 ? 'none' : 'width 60ms linear',
          }}
        />
      </div>

      {/* ── Ticker ── */}
      <Ticker accentColor={slide.hex} />
    </section>
  )
}

// ─── Slide content ────────────────────────────────────────────────────────────

function SlideContent({
  slide, active, cardX, cardY, tiltX, tiltY,
}: {
  slide: Slide
  active: boolean
  cardX: number
  cardY: number
  tiltX: number
  tiltY: number
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center px-6 pt-20 lg:px-10"
      style={{
        opacity:       active ? 1 : 0,
        transform:     active ? 'translateX(0) scale(1)' : 'translateX(-28px) scale(0.975)',
        transition:    'opacity 750ms cubic-bezier(0.4,0,0.2,1), transform 750ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px] lg:items-center">

        {/* ── Left: text ── */}
        <div>
          {/* Eyebrow */}
          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{
              borderColor:     `rgba(${slide.r},${slide.g},${slide.b},0.28)`,
              backgroundColor: `rgba(${slide.r},${slide.g},${slide.b},0.07)`,
              color:           slide.hex,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: slide.hex }}
            />
            {slide.eyebrow}
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-black leading-[0.90] tracking-[-0.03em]">
            <span className="block text-[clamp(2.8rem,7vw,6.5rem)] text-white">
              {slide.line1}
            </span>
            <span className="block text-[clamp(2.8rem,7vw,6.5rem)] text-white/55">
              {slide.line2}
            </span>
            <span
              className="block text-[clamp(2.8rem,7vw,6.5rem)]"
              style={{
                background:              `linear-gradient(125deg, ${slide.hex} 20%, rgba(${slide.r},${slide.g},${slide.b},0.55) 100%)`,
                WebkitBackgroundClip:    'text',
                WebkitTextFillColor:     'transparent',
                backgroundClip:          'text',
              }}
            >
              {slide.accent}
            </span>
          </h1>

          {/* Body */}
          <p className="mb-10 max-w-[480px] text-[1.05rem] leading-relaxed text-white/38">
            {slide.body}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={slide.cta.href}
              className="group inline-flex h-[52px] items-center gap-2.5 rounded-xl px-8 text-[13px] font-bold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{
                background:  `linear-gradient(135deg, ${slide.hex} 0%, rgba(${slide.r},${slide.g},${slide.b},0.65) 100%)`,
                boxShadow:   `0 0 40px rgba(${slide.r},${slide.g},${slide.b},0.28)`,
              }}
            >
              {slide.cta.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href={slide.ghost.href}
              className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-8 text-[13px] font-medium text-white/50 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
            >
              {slide.ghost.label}
            </Link>
          </div>
        </div>

        {/* ── Right: floating card ── */}
        <div
          className="hidden lg:flex justify-center items-center"
          style={{
            transform:  `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${cardX}px, ${cardY}px)`,
            transition: 'transform 200ms ease',
          }}
        >
          <FloatingCard slide={slide} />
        </div>

      </div>
    </div>
  )
}

// ─── Floating glassmorphism card ──────────────────────────────────────────────

function FloatingCard({ slide }: { slide: Slide }) {
  return (
    <div className="relative w-[380px]">

      {/* Outer glow */}
      <div
        className="absolute -inset-10 rounded-[48px] opacity-40"
        style={{
          background: `radial-gradient(circle at center, rgba(${slide.r},${slide.g},${slide.b},0.35) 0%, transparent 65%)`,
          filter:     'blur(24px)',
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-[28px] border border-white/[0.07] p-7 overflow-hidden"
        style={{ background: 'rgba(6, 10, 28, 0.82)', backdropFilter: 'blur(20px)' }}
      >
        {/* Top accent shimmer */}
        <div
          className="absolute top-0 left-10 right-10 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${slide.hex}, transparent)`, opacity: 0.5 }}
        />

        {/* Eyebrow */}
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em] mb-6"
          style={{ color: slide.hex }}
        >
          {slide.card.eyebrow}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {slide.card.stats.map((stat, i) => (
            <div key={i}>
              <p className="text-[1.6rem] font-black text-white leading-tight mb-1">
                {stat.val}
              </p>
              <p className="text-[10px] text-white/35 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05] mb-4" />

        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-11 mb-2">
          {slide.card.bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height:     `${h}%`,
                background: `rgba(${slide.r},${slide.g},${slide.b},${0.15 + i * 0.07})`,
                transition: 'background 700ms ease',
              }}
            />
          ))}
        </div>
        <p className="text-[9px] text-white/18 uppercase tracking-[0.18em]">
          Rendimiento del proyecto
        </p>

        {/* Corner decoration */}
        <div
          className="absolute bottom-0 right-0 w-28 h-28 rounded-tl-[80px] opacity-[0.04]"
          style={{ background: `radial-gradient(circle at bottom right, ${slide.hex} 0%, transparent 70%)` }}
        />
      </div>

      {/* Floating "live" badge */}
      <div
        className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm"
        style={{
          background: 'rgba(6,10,28,0.90)',
          color:       slide.hex,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: slide.hex }}
        />
        En vivo
      </div>

      {/* Floating mini-badge bottom-left */}
      <div
        className="absolute -bottom-3 -left-3 flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm"
        style={{
          background: 'rgba(6,10,28,0.90)',
          color:      'rgba(255,255,255,0.5)',
        }}
      >
        <span className="text-[10px]">🇺🇾</span>
        Uruguay
      </div>
    </div>
  )
}

// ─── Brand ticker ─────────────────────────────────────────────────────────────

const TICKER_WORDS = [
  'LANDING PAGE', '·', 'E-COMMERCE', '·', 'WEB APP', '·',
  'IA INTEGRADA', '·', 'MERCADOPAGO', '·', 'DISEÑO UX/UI', '·',
  'SEO', '·', 'SISTEMA COMPLETO', '·', 'URUGUAY', '·',
]

function Ticker({ accentColor }: { accentColor: string }) {
  const words = [...TICKER_WORDS, ...TICKER_WORDS]

  return (
    <div className="absolute bottom-14 left-0 right-0 overflow-hidden z-10 pointer-events-none">
      <div
        className="flex gap-6 whitespace-nowrap"
        style={{ animation: 'ticker 28s linear infinite' }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="text-[10px] font-black uppercase tracking-[0.22em] shrink-0"
            style={{
              color: word === '·'
                ? `rgba(${accentColor === '#6c63ff' ? '108,99,255' : accentColor === '#06b6d4' ? '6,182,212' : accentColor === '#a855f7' ? '168,85,247' : '34,197,94'},0.5)`
                : 'rgba(255,255,255,0.10)',
              transition: 'color 800ms ease',
            }}
          >
            {word}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
