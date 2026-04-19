import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative bg-background">

      {/* Top separator */}
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <img src="/logo.svg" alt="Simplemente" width={28} height={28} />
              <span className="text-[15px] font-semibold text-foreground">Simplemente</span>
            </Link>
            <p className="text-sm leading-relaxed text-foreground/30">
              Agencia de desarrollo web con IA.<br />
              Sistemas completos para el mercado uruguayo.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/30">
              Navegación
            </p>
            <ul className="space-y-2.5">
              {[
                { href: '/servicios', label: 'Servicios' },
                { href: '/portfolio', label: 'Portfolio' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/contacto', label: 'Contacto' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground/40 transition-colors duration-200 hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/30">
              Contacto
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/40">
              <li>Uruguay</li>
              <li>
                <a
                  href="mailto:simple@menteweb.com"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  simple@menteweb.com
                </a>
              </li>
              <li>
                <Link href="/login" className="transition-colors duration-200 hover:text-foreground">
                  Acceso clientes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-foreground/[0.04] pt-6 sm:flex-row">
          <p className="text-xs text-foreground/20">
            &copy; {new Date().getFullYear()} Simplemente. Todos los derechos reservados.
          </p>
          <div className="h-px w-8 bg-primary/30" />
        </div>
      </div>
    </footer>
  )
}
