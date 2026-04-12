import { Globe, ShoppingCart, Smartphone, Search, Wrench, Sparkles } from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Landing Page',
    description:
      'Páginas de presentación modernas que convierten visitas en clientes. Diseño profesional y optimizado.',
    price: 'Desde USD 300',
  },
  {
    icon: ShoppingCart,
    title: 'Tienda Online',
    description:
      'Ecommerce completo con catálogo, carrito y pago integrado con MercadoPago. Vendé 24/7.',
    price: 'Desde USD 1,000',
  },
  {
    icon: Smartphone,
    title: 'Aplicación Web',
    description:
      'Sistemas a medida para tu negocio: reservas, gestión, portales de clientes. Todo lo que necesitás.',
    price: 'Desde USD 2,000',
  },
  {
    icon: Search,
    title: 'SEO',
    description:
      'Posicionamiento en Google para que tus clientes te encuentren cuando te buscan.',
    price: 'Desde USD 100/mes',
  },
  {
    icon: Wrench,
    title: 'Mantenimiento',
    description:
      'Soporte continuo, actualizaciones y mejoras para que tu sitio siempre funcione perfecto.',
    price: 'Desde USD 50/mes',
  },
  {
    icon: Sparkles,
    title: 'Con IA incluida',
    description:
      'Chatbots, automatizaciones y asistentes inteligentes. La tecnología de hoy al servicio de tu negocio.',
    price: 'Incluido',
  },
]

export function ServicesGrid() {
  return (
    <section className="relative overflow-hidden bg-[#030E1A] py-28">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Servicios
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                ¿Qué hacemos?
              </h2>
              <p className="mt-3 max-w-lg text-white/50">
                Desde una landing simple hasta un sistema completo. Siempre con tecnología moderna y precios honestos.
              </p>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div key={service.title} className="group relative">
                {/* Gradient border (revealed on hover) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/60 via-violet-500/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Card inner */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#0A1628] p-6 transition-colors duration-300 group-hover:border-transparent group-hover:bg-[#0d1f38]">

                  {/* Icon */}
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/[0.15] group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 font-semibold text-white">{service.title}</h3>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-white/50">
                    {service.description}
                  </p>

                  {/* Price tag */}
                  <div className="flex items-center gap-2">
                    <span className="h-px w-4 bg-primary/40" />
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      {service.price}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
