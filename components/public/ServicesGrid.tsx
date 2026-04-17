import Link from 'next/link'
import { Globe, ShoppingCart, Smartphone, Search, Wrench, Sparkles, Package, ArrowRight } from 'lucide-react'

const services = [
  {
    icon:        Globe,
    title:       'Landing Page',
    description: 'Páginas de presentación que convierten visitas en clientes. Diseño profesional, velocidad extrema y optimizado para móvil.',
    price:       'Desde $5.000 UYU',
    color:       { r: 108, g: 99,  b: 255 },
  },
  {
    icon:        ShoppingCart,
    title:       'Tienda Online',
    description: 'E-commerce completo con catálogo, carrito y MercadoPago integrado. Tu tienda abierta 24/7 desde el día uno.',
    price:       'Desde $20.000 UYU',
    color:       { r: 168, g: 85,  b: 247 },
  },
  {
    icon:        Smartphone,
    title:       'Aplicación Web',
    description: 'Sistemas a medida: reservas, gestión de clientes, portales. Todo lo que tu negocio necesita, construido con IA.',
    price:       'Desde $40.000 UYU',
    color:       { r: 6,   g: 182, b: 212 },
  },
  {
    icon:        Search,
    title:       'SEO',
    description: 'Posicionamiento en Google para que tus clientes te encuentren cuando más te necesitan.',
    price:       'Desde $3.500 UYU/mes',
    color:       { r: 245, g: 158, b: 11  },
  },
  {
    icon:        Wrench,
    title:       'Mantenimiento',
    description: 'Soporte continuo, actualizaciones y mejoras para que tu sitio siempre funcione perfecto.',
    price:       'Desde $3.500 UYU/mes',
    color:       { r: 34,  g: 197, b: 94  },
  },
  {
    icon:        Sparkles,
    title:       'IA Incluida',
    description: 'Chatbots, automatizaciones y asistentes inteligentes integrados en cada proyecto sin costo extra.',
    price:       'Incluido en todo',
    color:       { r: 236, g: 72,  b: 153 },
  },
]

export function ServicesGrid() {
  return (
    <section className="relative overflow-hidden bg-[#030E1A] py-28">

      {/* Top separator */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            Servicios
          </p>
          <h2 className="text-4xl font-black leading-[1.0] tracking-tight text-white md:text-5xl">
            ¿Qué hacemos?
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-white/40">
            Desde una landing simple hasta un sistema completo.
            Siempre con tecnología moderna y precios honestos para Uruguay.
          </p>
        </div>

        {/* ── Services grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {services.map((service) => {
            const Icon = service.icon
            const { r, g, b } = service.color
            return (
              <div key={service.title} className="group relative">
                {/* Hover gradient border */}
                <div
                  className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, rgba(${r},${g},${b},0.55) 0%, rgba(${r},${g},${b},0.08) 100%)`,
                  }}
                />
                <div
                  className="relative flex h-full flex-col rounded-2xl border border-white/[0.06] p-6 transition-all duration-300 group-hover:border-transparent"
                  style={{ background: 'rgba(10, 14, 32, 0.95)' }}
                >
                  {/* Icon */}
                  <div
                    className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105"
                    style={{
                      borderColor:     `rgba(${r},${g},${b},0.22)`,
                      backgroundColor: `rgba(${r},${g},${b},0.08)`,
                      color:           `rgb(${r},${g},${b})`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 text-[15px] font-bold text-white">{service.title}</h3>
                  <p className="mb-5 flex-1 text-[13px] leading-relaxed text-white/42">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-px w-5 rounded-full"
                      style={{ backgroundColor: `rgba(${r},${g},${b},0.5)` }}
                    />
                    <p
                      className="text-[11px] font-black uppercase tracking-widest"
                      style={{ color: `rgb(${r},${g},${b})` }}
                    >
                      {service.price}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Paquete Completo CTA card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06]"
          style={{ background: 'rgba(10, 14, 32, 0.95)' }}>

          {/* Background accent */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: 'radial-gradient(ellipse at 80% 50%, rgba(108,99,255,0.8) 0%, transparent 60%)',
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              {/* Package icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.10]">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
                  ⭐ Paquete Completo
                </div>
                <h3 className="text-xl font-black text-white">
                  $20.000 UYU entrada + $8.000 UYU/mes
                </h3>
                <p className="mt-1 text-[13px] text-white/40 max-w-lg">
                  Página web + sistema de gestión completo. El mantenimiento mensual incluye mejoras continuas,
                  creación de contenido e inteligencia artificial para hacer crecer tu proyecto.
                </p>
              </div>
            </div>
            <Link
              href="/contacto"
              className="group shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[13px] font-bold text-white transition-all duration-300 hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/20"
            >
              Me interesa
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom separator */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </section>
  )
}
