import type { Metadata } from 'next'
import { ContactForm } from '@/components/public/ContactForm'

export const metadata: Metadata = { title: 'Contacto' }

export default function ContactoPage() {
  return (
    <div>
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Contacto
        </p>
        <h1 className="mb-4 text-4xl font-bold text-foreground">Hablemos de tu proyecto</h1>
        <p className="text-muted-foreground">
          Contanos sobre tu proyecto. Te respondemos en menos de 24 horas.
        </p>
      </div>
      <ContactForm />
    </div>
  )
}
