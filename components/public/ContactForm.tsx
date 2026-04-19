'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Send, Sparkles } from 'lucide-react'

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
  'w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/25 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-foreground/[0.06] focus:ring-1 focus:ring-primary/20'

const labelClass = 'block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromChat, setFromChat] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // ── Pre-fill from chat widget intent ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('simplemente_chat_intent')
      if (!raw) return
      sessionStorage.removeItem('simplemente_chat_intent')
      const intent = JSON.parse(raw) as {
        projectType?: string
        budgetRange?: string
        planLabel?:   string
        summary?:     string
      }
      let filled = false
      if (intent.projectType) { setValue('project_type', intent.projectType); filled = true }
      if (intent.budgetRange)  { setValue('budget_range', intent.budgetRange); filled = true }
      if (intent.summary?.trim()) {
        setValue('message', intent.summary.trim())
        filled = true
      }
      if (filled) setFromChat(true)
    } catch { /* ignore */ }
  }, [setValue])

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
      <section id="contacto" className="relative overflow-hidden bg-background py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/[0.08]">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground">¡Recibimos tu mensaje!</h2>
          <p className="text-foreground/40">
            Te vamos a contactar en las próximas 24 horas para hablar sobre tu proyecto.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-background py-28">

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
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">¿Hablamos?</h2>
            <p className="text-foreground/40">
              Contanos sobre tu proyecto y te respondemos en menos de 24 horas.
            </p>
          </div>

          {/* Chat pre-fill banner */}
          {fromChat && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg,#6c63ff,#a855f7)' }}>
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-[13px] text-violet-300/90 leading-snug">
                Rellenamos el formulario con lo que nos contaste en el chat.{' '}
                <span className="text-white/60">Revisá y completá los campos que falten.</span>
              </p>
            </div>
          )}

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
                  <option value="" className="bg-background">Seleccioná...</option>
                  <option value="landing" className="bg-background">Landing page</option>
                  <option value="ecommerce" className="bg-background">Tienda online</option>
                  <option value="web_app" className="bg-background">Aplicación web</option>
                  <option value="seo" className="bg-background">SEO</option>
                  <option value="maintenance" className="bg-background">Mantenimiento</option>
                  <option value="other" className="bg-background">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget_range" className={labelClass}>Presupuesto estimado</label>
                <select id="budget_range" {...register('budget_range')} className={fieldClass}>
                  <option value="" className="bg-background">Seleccioná...</option>
                  <option value="lt5k"      className="bg-background">Menos de $5.000 UYU</option>
                  <option value="5k-10k"    className="bg-background">$5.000 – $10.000 UYU</option>
                  <option value="10k-20k"   className="bg-background">$10.000 – $20.000 UYU</option>
                  <option value="20k-40k"   className="bg-background">$20.000 – $40.000 UYU</option>
                  <option value="gt40k"     className="bg-background">Más de $40.000 UYU</option>
                  <option value="paquete"   className="bg-background">Paquete completo ($20K + $8K/mes)</option>
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
