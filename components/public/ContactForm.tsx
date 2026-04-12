'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Send } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Contanos más sobre tu proyecto'),
  project_type: z.string().optional(),
  budget_range: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const fieldClass =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-primary/20'

const labelClass = 'block text-xs font-medium uppercase tracking-widest text-white/40 mb-1.5'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'landing_form' }),
    })
    if (res.ok) {
      setSubmitted(true)
    } else {
      setError('Hubo un error. Intentá de nuevo o escribinos directamente.')
    }
  }

  if (submitted) {
    return (
      <section id="contacto" className="relative overflow-hidden bg-[#030E1A] py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/[0.08]">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">¡Recibimos tu mensaje!</h2>
          <p className="text-white/40">
            Te vamos a contactar en las próximas 24 horas para hablar sobre tu proyecto.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-[#030E1A] py-28">

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/[0.06] blur-[80px]" />
      </div>

      {/* Top separator line */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          {/* Header */}
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Contacto
            </p>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">¿Hablamos?</h2>
            <p className="text-white/40">
              Contanos sobre tu proyecto y te respondemos en menos de 24 horas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label htmlFor="name" className={labelClass}>Nombre *</label>
                <input id="name" {...register('name')} placeholder="Tu nombre" className={fieldClass} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Email *</label>
                <input id="email" type="email" {...register('email')} placeholder="tu@email.com" className={fieldClass} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>Teléfono</label>
                <input id="phone" {...register('phone')} placeholder="09X XXX XXX" className={fieldClass} />
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>Empresa</label>
                <input id="company" {...register('company')} placeholder="Nombre de tu empresa" className={fieldClass} />
              </div>

              <div>
                <label htmlFor="project_type" className={labelClass}>Tipo de proyecto</label>
                <select id="project_type" {...register('project_type')} className={fieldClass}>
                  <option value="" className="bg-[#0A1628]">Seleccioná...</option>
                  <option value="landing" className="bg-[#0A1628]">Landing page</option>
                  <option value="ecommerce" className="bg-[#0A1628]">Tienda online</option>
                  <option value="web_app" className="bg-[#0A1628]">Aplicación web</option>
                  <option value="seo" className="bg-[#0A1628]">SEO</option>
                  <option value="maintenance" className="bg-[#0A1628]">Mantenimiento</option>
                  <option value="other" className="bg-[#0A1628]">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget_range" className={labelClass}>Presupuesto estimado</label>
                <select id="budget_range" {...register('budget_range')} className={fieldClass}>
                  <option value="" className="bg-[#0A1628]">Seleccioná...</option>
                  <option value="lt300" className="bg-[#0A1628]">Menos de USD 300</option>
                  <option value="300-600" className="bg-[#0A1628]">USD 300 – 600</option>
                  <option value="600-1200" className="bg-[#0A1628]">USD 600 – 1,200</option>
                  <option value="1200-3000" className="bg-[#0A1628]">USD 1,200 – 3,000</option>
                  <option value="gt3000" className="bg-[#0A1628]">Más de USD 3,000</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>Contanos sobre tu proyecto *</label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                placeholder="¿Qué necesitás? ¿Tenés algún ejemplo o referencia?"
                className={`${fieldClass} resize-none`}
              />
              {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-primary to-violet-600 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-violet-600 hover:to-primary hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Enviar mensaje
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
