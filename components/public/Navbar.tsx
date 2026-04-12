'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#020D18]/90 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <img src="/logo.svg" alt="Simplemente" width={30} height={30} />
          <span className="text-[15px] font-semibold tracking-tight">Simplemente</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-white/50 transition-colors duration-200 hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/contacto"
            className="group relative inline-flex h-9 items-center overflow-hidden rounded-lg px-5 text-sm font-medium text-white transition-all duration-300"
          >
            {/* gradient border via background trick */}
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-violet-500 opacity-100 transition-opacity duration-300 group-hover:opacity-80" />
            <span className="absolute inset-[1px] rounded-[7px] bg-[#020D18] transition-colors duration-300 group-hover:bg-[#0a0a1f]" />
            <span className="relative">Hablemos</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="p-2 text-white/60 transition-colors hover:text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-[#020D18]/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto max-w-7xl flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Hablemos
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
