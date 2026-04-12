import Link from 'next/link'
import { ArrowRight, Zap, Globe, Brain, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#020D18]">

      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[120px]" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-primary/[0.06] blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-36 lg:px-8">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" />
          Sistemas web creados con IA · Uruguay
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
          Tu negocio en internet,{' '}
          <span className="bg-gradient-to-r from-primary via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            simplemente.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/50 md:text-xl">
          Creamos páginas web y sistemas completos usando inteligencia artificial.
          Rápido, moderno y a precio accesible para el mercado uruguayo.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Primary */}
          <Link
            href="/contacto"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl px-7 text-sm font-semibold text-white transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 transition-all duration-300 group-hover:from-violet-600 group-hover:to-primary" />
            <span className="relative flex items-center gap-2">
              Quiero mi proyecto
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Secondary */}
          <Link
            href="/portfolio"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl px-7 text-sm font-semibold text-white transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.08] to-white/[0.04] transition-all duration-300 group-hover:from-white/[0.12] group-hover:to-white/[0.08]" />
            <span className="absolute inset-0 rounded-xl border border-white/[0.10]" />
            <span className="relative">Ver portfolio</span>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-3 gap-0 border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.02] divide-x divide-white/[0.06]">
          {[
            { icon: Globe,  value: '4+',  label: 'Proyectos activos' },
            { icon: Brain,  value: 'IA',  label: 'En cada proyecto'  },
            { icon: Zap,    value: '🇺🇾', label: 'Mercado uruguayo'  },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-6 text-center sm:flex-row sm:gap-4 sm:text-left">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
