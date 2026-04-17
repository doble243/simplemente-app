'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Brain, TrendingUp, LayoutGrid, Network } from 'lucide-react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.28) {
  const ref = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setEntered(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, entered }
}

/** Count from 0 → target when `start` becomes true */
function useCountUp(target: number, duration = 1400, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf: number
    const begin = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - begin) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setCount(Math.floor(eased * target))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return count
}

/** Magnetic effect — button moves toward cursor */
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength })
  }, [strength])
  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), [])
  return { ref, pos, onMove, onLeave }
}

/** 3D tilt for cards */
function useTilt(maxDeg = 9) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, glare: { x: 50, y: 50 } })
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width   // 0–1
    const ny = (e.clientY - r.top)  / r.height  // 0–1
    setTilt({ x: (ny - 0.5) * maxDeg * 2, y: (nx - 0.5) * -maxDeg * 2, glare: { x: nx * 100, y: ny * 100 } })
  }, [maxDeg])
  const onLeave = useCallback(() => setTilt({ x: 0, y: 0, glare: { x: 50, y: 50 } }), [])
  return { ref, tilt, onMove, onLeave }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function show(entered: boolean, delay: number) {
  return {
    opacity:    entered ? 1 : 0,
    transform:  entered ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.78s ease ${delay}ms, transform 0.78s ease ${delay}ms`,
  } as React.CSSProperties
}

function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.022]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  )
}

// ─── Section 0 — Hero (dark) ──────────────────────────────────────────────────
function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  const [mouse, setMouse]   = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLElement>(null)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden"
      style={{ background: '#0d0b08' }}
      onMouseMove={onMouseMove}
    >
      {/* Mouse-parallax orbs */}
      {[
        { top: '-8%', right: '-4%', size: '55%', color: 'rgba(201,169,110,0.14)', mx: -45, my: -32 },
        { bottom: '4%', left: '-4%', size: '42%', color: 'rgba(180,140,70,0.10)', mx: 32, my: 22 },
        { top: '35%', right: '15%', size: '28%', color: 'rgba(201,169,110,0.07)', mx: -20, my: -15 },
      ].map((o, i) => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{
            ...(o.top    ? { top:    o.top    } : {}),
            ...(o.bottom ? { bottom: o.bottom } : {}),
            ...(o.right  ? { right:  o.right  } : {}),
            ...(o.left   ? { left:   o.left   } : {}),
            width: o.size, height: o.size,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            transform:  `translate(${mouse.x * o.mx}px, ${mouse.y * o.my}px)`,
            transition: `transform ${0.7 + i * 0.15}s cubic-bezier(0.22,1,0.36,1)`,
          }}
        />
      ))}

      <div className="relative z-10 px-8 py-24 lg:px-16"
        style={{ paddingTop: 'max(120px, env(safe-area-inset-top,120px))' }}>

        <div style={show(loaded, 80)}>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/30">
            Agencia Web · Montevideo, Uruguay
          </span>
          <div className="mt-3 h-[1px] bg-white/10"
            style={{ width: loaded ? '40px' : '0px', transition: 'width 0.8s ease 420ms' }}
          />
        </div>

        <h1 className="my-7 font-light leading-[1.02] tracking-tight text-white"
          style={{ ...show(loaded, 210), fontSize: 'clamp(46px, 10vw, 92px)' }}>
          Hacemos cosas<br />
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>que venden</span>
        </h1>

        <p className="mb-12 max-w-sm text-[15px] leading-relaxed text-white/35"
          style={show(loaded, 370)}>
          Transformamos la forma en que funcionan los negocios. Creamos sistemas que ordenan, optimizan y automatizan procesos — incorporando IA solo donde hace la diferencia.
        </p>

        <div className="flex items-center gap-6" style={show(loaded, 540)}>
          <Link href="/portfolio"
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-white/50 transition-colors hover:text-white/80">
            Ver proyectos
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/contacto"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-white/30 transition-colors hover:text-white/60">
            Contacto
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-white/8">01</div>
    </section>
  )
}

// ─── Section 1 — Filosofía (light) ───────────────────────────────────────────
function FilosofiaSection() {
  const { ref, entered } = useInView(0.3)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden"
      style={{ background: '#f5f7f5' }}>

      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(201,169,110,0.08) 0%, transparent 55%)' }}
      />
      <div className="absolute top-0 left-10 h-[1px]"
        style={{ width: entered ? '40px' : '0px', background: '#1a1a1a', opacity: 0.18, transition: 'width 0.9s ease 500ms' }}
      />

      <div className="relative z-10 px-8 py-28 lg:px-16"
        style={{ paddingTop: 'max(112px, env(safe-area-inset-top,112px))' }}>

        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-black/35"
          style={show(entered, 80)}>
          Cómo pensamos
        </p>

        <h2 className="mb-6 font-light leading-[1.02] tracking-tight text-[#1a1a1a]"
          style={{ ...show(entered, 200), fontSize: 'clamp(38px, 8vw, 76px)' }}>
          Menos complicación,<br />
          <span style={{ color: 'rgba(26,26,26,0.38)' }}>más impacto</span>
        </h2>

        <p className="mb-6 max-w-md text-[16px] leading-relaxed text-black/50"
          style={show(entered, 340)}>
          Creamos sistemas que ordenan, optimizan y automatizan procesos, incorporando inteligencia artificial solo donde hace la diferencia: en el tiempo, la eficiencia y los resultados.
        </p>

        <p className="max-w-xs text-[14px] leading-relaxed italic text-black/30"
          style={show(entered, 460)}>
          "Simplificar no es hacer menos, es hacer mejor."
        </p>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-black/8">02</div>
    </section>
  )
}

// ─── Section 2 — Números / Stats (dark) ──────────────────────────────────────
const STATS = [
  { value: 5,    suffix: '+',  label: 'proyectos activos',      sub: 'En distintos rubros del mercado UY' },
  { value: 48,   suffix: 'hs', label: 'respuesta promedio',     sub: 'Desde el primer contacto' },
  { value: 100,  suffix: '%',  label: 'en Uruguay',             sub: 'Conocemos el mercado local' },
]

function StatCard({ stat, start, index }: { stat: typeof STATS[0]; start: boolean; index: number }) {
  const count = useCountUp(stat.value, 1300 + index * 100, start)
  return (
    <div style={{
      opacity:    start ? 1 : 0,
      transform:  start ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.75s ease ${index * 140}ms, transform 0.75s ease ${index * 140}ms`,
    }}>
      <div className="mb-1 font-light leading-none tracking-tight text-white"
        style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}>
        {count}{stat.suffix}
      </div>
      <div className="mb-1 text-[14px] font-medium text-white/60">{stat.label}</div>
      <div className="text-[12px] text-white/28 leading-snug max-w-[140px]">{stat.sub}</div>
    </div>
  )
}

function NumerosSection() {
  const { ref, entered } = useInView(0.3)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[80dvh] flex-col justify-center overflow-hidden"
      style={{ background: '#0d0b08' }}>

      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.10) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 left-10 h-[1px]"
        style={{ width: entered ? '40px' : '0px', background: '#c9a96e', opacity: 0.45, transition: 'width 0.9s ease 500ms' }}
      />

      <div className="relative z-10 px-8 py-24 lg:px-16">
        <p className="mb-14 text-[11px] font-medium uppercase tracking-[0.22em] text-white/30"
          style={show(entered, 80)}>
          El trabajo habla
        </p>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} start={entered} index={i} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-white/8">03</div>
    </section>
  )
}

// ─── Section 3 — Pilares (light) con tilt cards ───────────────────────────────
const PILLARS = [
  {
    icon:   LayoutGrid,
    title:  'Organización y eficiencia',
    body:   'Estructuramos procesos y canales digitales, reduciendo la desorganización y mejorando el uso del tiempo y los recursos.',
    accent: '#7ab3c8',
  },
  {
    icon:   TrendingUp,
    title:  'Mejora de resultados',
    body:   'Optimizamos el rendimiento de los negocios, incrementando su capacidad de venta y conversión a través de sistemas más eficientes.',
    accent: '#c9a96e',
  },
  {
    icon:   Network,
    title:  'Escalabilidad',
    body:   'Desarrollamos estructuras digitales que permiten crecer de forma sostenible, sin depender exclusivamente del esfuerzo operativo manual.',
    accent: '#4ade80',
  },
  {
    icon:   Brain,
    title:  'Integración inteligente de IA',
    body:   'Incorporamos inteligencia artificial en puntos estratégicos, priorizando su impacto real en productividad, automatización y toma de decisiones.',
    accent: '#a78bfa',
  },
]

function PillarCard({ pillar, entered, index }: { pillar: typeof PILLARS[0]; entered: boolean; index: number }) {
  const { ref, tilt, onMove, onLeave } = useTilt(7)
  const Icon = pillar.icon

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-2xl border p-7 cursor-default"
      style={{
        borderColor:  `${pillar.accent}20`,
        background:   `${pillar.accent}05`,
        transform:    entered
          ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(0)`
          : 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(24px)',
        opacity:      entered ? 1 : 0,
        transition:   `transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.75s ease ${index * 130 + 150}ms, box-shadow 0.3s ease`,
        transitionDelay: tilt.x !== 0 ? '0ms' : `${index * 130 + 150}ms`,
        boxShadow:    `0 ${8 + Math.abs(tilt.x)}px ${24 + Math.abs(tilt.x) * 3}px rgba(0,0,0,0.07)`,
      }}
    >
      {/* Glare */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${tilt.x !== 0 ? (50 + tilt.y * 5) : 50}% ${tilt.x !== 0 ? (50 + tilt.x * 5) : 50}%, ${pillar.accent}12 0%, transparent 60%)`,
          transition: 'background 0.2s ease',
        }}
      />

      <div className="relative z-10">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${pillar.accent}14` }}>
          <Icon className="h-5 w-5" style={{ color: pillar.accent }} />
        </div>
        <h3 className="mb-2.5 text-[17px] font-medium tracking-tight text-[#1a1a1a]">
          {pillar.title}
        </h3>
        <p className="text-[14px] leading-relaxed text-black/45">{pillar.body}</p>
      </div>
    </div>
  )
}

function PilaresSection() {
  const { ref, entered } = useInView(0.2)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden"
      style={{ background: '#f5f7f5' }}>

      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 15% 60%, rgba(201,169,110,0.05) 0%, transparent 50%)' }}
      />
      <div className="absolute top-0 left-10 h-[1px]"
        style={{ width: entered ? '40px' : '0px', background: '#1a1a1a', opacity: 0.15, transition: 'width 0.9s ease 500ms' }}
      />

      <div className="relative z-10 px-8 py-28 lg:px-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-black/30"
          style={show(entered, 80)}>
          Nuestros objetivos
        </p>
        <h2 className="mb-14 font-light leading-[1.02] tracking-tight text-[#1a1a1a]"
          style={{ ...show(entered, 200), fontSize: 'clamp(36px, 7vw, 66px)' }}>
          Para qué<br />
          <span style={{ color: 'rgba(26,26,26,0.38)' }}>estamos acá</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} pillar={p} entered={entered} index={i} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-black/8">04</div>
    </section>
  )
}

// ─── Section 4 — Proceso (dark) ───────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Nos escribís',    body: 'Contás tu idea — por WhatsApp, formulario, como te quede cómodo.' },
  { n: '02', title: 'Vemos el proyecto', body: 'Analizamos qué necesitás y armamos una propuesta concreta en 24hs.' },
  { n: '03', title: 'Construimos',     body: 'Diseño, desarrollo y pruebas. Te mostramos avances en todo momento.' },
  { n: '04', title: 'Lanzamos',        body: 'Publicamos y te entregamos todo. Seguimos con soporte si lo necesitás.' },
]

function ProcesoSection() {
  const { ref, entered } = useInView(0.2)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden"
      style={{ background: '#0d0b08' }}>

      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(201,169,110,0.06) 0%, transparent 55%)' }}
      />
      <div className="absolute top-0 left-10 h-[1px]"
        style={{ width: entered ? '40px' : '0px', background: '#c9a96e', opacity: 0.45, transition: 'width 0.9s ease 500ms' }}
      />

      <div className="relative z-10 px-8 py-28 lg:px-16">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white/28"
          style={show(entered, 80)}>
          Cómo trabajamos
        </p>
        <h2 className="mb-16 font-light leading-[1.02] tracking-tight text-white"
          style={{ ...show(entered, 200), fontSize: 'clamp(36px, 7vw, 66px)' }}>
          Sin vueltas,<br />
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>sin sorpresas</span>
        </h2>

        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="group flex items-start gap-6 border-t border-white/[0.06] py-7"
              style={{
                opacity:    entered ? 1 : 0,
                transform:  entered ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 0.7s ease ${i * 120 + 300}ms, transform 0.7s ease ${i * 120 + 300}ms`,
              }}
            >
              {/* Step number */}
              <span className="w-10 shrink-0 text-[12px] font-light tracking-widest text-white/18 tabular-nums transition-colors group-hover:text-white/40">
                {step.n}
              </span>
              {/* Dot */}
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/15 transition-all duration-300 group-hover:scale-125 group-hover:bg-white/40" />
              {/* Content */}
              <div>
                <p className="mb-1 text-[16px] font-medium text-white/80 transition-colors group-hover:text-white">
                  {step.title}
                </p>
                <p className="text-[14px] leading-relaxed text-white/32">{step.body}</p>
              </div>
            </div>
          ))}
          {/* Final border */}
          <div className="border-t border-white/[0.06]" />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-white/8">05</div>
    </section>
  )
}

// ─── Section 5 — CTA final (light) ───────────────────────────────────────────
function CTASection() {
  const { ref, entered } = useInView(0.3)
  const mag = useMagnetic(0.32)

  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className="relative flex min-h-[85dvh] flex-col items-center justify-center overflow-hidden text-center"
      style={{ background: '#f5f7f5' }}>

      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 75%, rgba(201,169,110,0.07) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 px-8">
        <div className="mb-8 flex flex-col items-center" style={show(entered, 80)}>
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-black/28">
            ¿Tenés algo en mente?
          </span>
          <div className="mt-3 h-[1px] bg-black/10"
            style={{ width: entered ? '40px' : '0px', transition: 'width 0.9s ease 460ms' }}
          />
        </div>

        <h2 className="mb-7 font-light leading-[1.02] tracking-tight text-[#1a1a1a]"
          style={{ ...show(entered, 210), fontSize: 'clamp(38px, 8vw, 74px)' }}>
          Hablemos,<br />
          <span style={{ color: 'rgba(26,26,26,0.38)' }}>sin vueltas</span>
        </h2>

        {/* Misión / Visión */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg mx-auto w-full text-left"
          style={show(entered, 360)}>
          <div className="rounded-2xl border border-black/[0.07] bg-black/[0.03] px-5 py-4">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-black/30">Misión</p>
            <p className="text-[13px] leading-relaxed text-black/55">
              Diseñar sistemas que hagan que los negocios funcionen mejor. Ordenamos, optimizamos y aplicamos IA de forma estratégica.
            </p>
          </div>
          <div className="rounded-2xl border border-black/[0.07] bg-black/[0.03] px-5 py-4">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-black/30">Visión</p>
            <p className="text-[13px] leading-relaxed text-black/55">
              Redefinir la forma en que crecen los negocios: la clave no está en hacer más, sino en construir sistemas más inteligentes.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4" style={show(entered, 490)}>
          {/* Magnetic primary CTA */}
          <Link
            ref={mag.ref}
            href="/contacto"
            onMouseMove={mag.onMove}
            onMouseLeave={mag.onLeave}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#1a1a1a] px-8 py-4 text-[14px] font-medium text-white"
            style={{
              transform:  `translate(${mag.pos.x}px, ${mag.pos.y}px)`,
              transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), background 0.2s ease',
              boxShadow:  '0 20px 50px rgba(0,0,0,0.12)',
            }}
          >
            Empezar proyecto
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link href="/portfolio"
            className="text-[13px] font-medium text-black/32 transition-colors hover:text-black/60 flex items-center gap-1.5">
            Ver proyectos anteriores
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-[12px] font-light tracking-widest text-black/8">06</div>
    </section>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function NosotrosShowcase() {
  return (
    <div className="relative">
      <GrainOverlay />
      <HeroSection />
      <FilosofiaSection />
      <NumerosSection />
      <PilaresSection />
      <ProcesoSection />
      <CTASection />
    </div>
  )
}
