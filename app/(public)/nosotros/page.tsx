import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Zap, Heart, ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Nosotros' }

export default function NosotrosPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-20">
      <div className="mb-14">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Nosotros
        </p>
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Creamos sistemas web con IA
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Somos Simplemente — una agencia web uruguaya que usa inteligencia artificial
          para crear sistemas y páginas web de alta calidad a precios accesibles.
        </p>
      </div>

      <div className="mb-14 grid gap-6">
        {[
          {
            icon: Brain,
            title: 'IA en cada proyecto',
            body: 'Usamos las herramientas de IA más modernas para diseñar, desarrollar y optimizar cada proyecto. Esto nos permite trabajar más rápido y ofrecer resultados de mayor calidad.',
          },
          {
            icon: Heart,
            title: 'Foco en Uruguay',
            body: 'Conocemos el mercado uruguayo: MercadoPago, URSEC, preferencias locales y necesidades de las pymes nacionales. Nuestros proyectos están pensados para Uruguay.',
          },
          {
            icon: Zap,
            title: 'Entrega rápida',
            body: 'Una landing page lista en días, no meses. Gracias a la IA y a nuestro proceso optimizado, reducimos tiempos sin sacrificar calidad.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-5 rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/20">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="mb-1 font-semibold text-foreground">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-[oklch(0.13_0.03_275)] p-10 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.25_0.12_275/0.3),transparent_70%)]" />
        <h2 className="mb-2 text-xl font-bold text-white">¿Querés trabajar con nosotros?</h2>
        <p className="mb-6 text-white/50">Contanos sobre tu proyecto.</p>
        <Button asChild className="gap-2 shadow-lg shadow-primary/25">
          <Link href="/contacto">
            Hablemos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
