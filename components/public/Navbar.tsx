'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/public/ThemeToggle'

const links = [
  { href: '/servicios',  label: 'Servicios',  sub: 'Lo que hacemos' },
  { href: '/portfolio',  label: 'Portfolio',  sub: 'Proyectos reales' },
  { href: '/nosotros',   label: 'Nosotros',   sub: 'Quiénes somos' },
  { href: '/contacto',   label: 'Contacto',   sub: 'Hablemos' },
]

export function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-foreground/[0.06] bg-background/90 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-foreground" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="Simplemente" width={30} height={30} />
            <span className="text-[15px] font-semibold tracking-tight">Simplemente</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA + theme */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="group relative inline-flex h-9 items-center overflow-hidden rounded-lg px-5 text-sm font-medium text-white transition-all duration-300"
            >
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-violet-500 opacity-100 transition-opacity duration-300 group-hover:opacity-80" />
              <span className="absolute inset-[1px] rounded-[7px] bg-background transition-colors duration-300 group-hover:bg-muted" />
              <span className="relative text-foreground">Hablemos</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] text-foreground/70 transition-all duration-200 hover:border-foreground/[0.14] hover:bg-foreground/[0.08] hover:text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            <span
              className="absolute transition-all duration-200"
              style={{ opacity: open ? 0 : 1, transform: open ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}
            >
              <Menu className="h-5 w-5" />
            </span>
            <span
              className="absolute transition-all duration-200"
              style={{ opacity: open ? 1 : 0, transform: open ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)' }}
            >
              <X className="h-5 w-5" />
            </span>
          </button>
        </div>
      </header>

      {/* ── Full-screen mobile overlay ── */}
      <div
        className="fixed inset-0 z-[55] md:hidden"
        style={{
          pointerEvents:  open ? 'auto' : 'none',
          opacity:        open ? 1 : 0,
          transition:     'opacity 0.35s ease',
        }}
      >
        {/* Blurred backdrop */}
        <div
          className="absolute inset-0 backdrop-blur-[28px]"
          style={{ background: 'var(--pub-overlay-bg)' }}
        />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col px-6 pt-20 pb-10">

          {/* Back / close row */}
          <div
            className="mb-6 flex items-center justify-between"
            style={{
              transform:  open ? 'translateY(0)' : 'translateY(-10px)',
              opacity:    open ? 1 : 0,
              transition: 'transform 0.3s ease, opacity 0.25s ease',
            }}
          >
            <button
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2 rounded-xl border border-foreground/[0.09] bg-foreground/[0.04] px-4 py-2 text-[13px] font-semibold text-foreground/60 transition-all duration-200 hover:border-foreground/[0.16] hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 12L6 8l4-4" />
              </svg>
              Volver
            </button>
            <ThemeToggle />
          </div>

          {/* Nav links */}
          <nav className="flex-1">
            <div className="space-y-1">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 hover:bg-foreground/[0.04]"
                  style={{
                    transform:  open ? 'translateY(0)' : 'translateY(20px)',
                    opacity:    open ? 1 : 0,
                    transition: `transform 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms, opacity 0.35s ease ${i * 60}ms, background 0.15s ease`,
                  }}
                >
                  <div>
                    <p className="text-[28px] font-bold tracking-tight text-foreground/90 leading-none">
                      {link.label}
                    </p>
                    <p className="mt-1 text-[12px] text-foreground/30 font-medium">{link.sub}</p>
                  </div>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] text-foreground/30 transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </nav>

          {/* Bottom CTA */}
          <div
            style={{
              transform:  open ? 'translateY(0)' : 'translateY(20px)',
              opacity:    open ? 1 : 0,
              transition: `transform 0.4s cubic-bezier(0.22,1,0.36,1) ${links.length * 60 + 40}ms, opacity 0.35s ease ${links.length * 60 + 40}ms`,
            }}
          >
            {/* Separator */}
            <div className="mb-6 h-px bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />

            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="group flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-[15px] font-bold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)',
                boxShadow:  '0 20px 50px rgba(108,99,255,0.25)',
              }}
            >
              <span>Empezar proyecto</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="mt-4 text-center text-[11px] text-foreground/20">
              Respondemos en menos de 24 horas · Uruguay
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
