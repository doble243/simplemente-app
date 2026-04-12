import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ServicesGrid } from '@/components/public/ServicesGrid'

export const metadata: Metadata = { title: 'Servicios' }

export default function ServiciosPage() {
  return (
    <div>
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Servicios
        </p>
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Todo para tu presencia digital
        </h1>
        <p className="text-lg text-muted-foreground">
          Todo lo que necesitás para tener presencia digital en Uruguay.
          Tecnología moderna, precio accesible.
        </p>
      </div>

      <ServicesGrid />

      <div className="bg-background py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">¿No encontrás lo que buscás?</h2>
        <p className="mb-8 text-muted-foreground">Hablemos, seguro encontramos la solución ideal para tu proyecto.</p>
        <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25">
          <Link href="/contacto">
            Consultanos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
