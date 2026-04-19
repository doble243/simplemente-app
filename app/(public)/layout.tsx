import type { Metadata } from 'next'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { ChatWidget } from '@/components/public/ChatWidget'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://simplemente.uy'

export const metadata: Metadata = {
  title: {
    template: '%s | Simplemente',
    default: 'Simplemente — Agencia Web con IA para Uruguay',
  },
  description:
    'Creamos páginas web y sistemas completos con inteligencia artificial para el mercado uruguayo. Rápido, moderno y accesible.',
  keywords: ['agencia web', 'uruguay', 'diseño web', 'desarrollo web', 'inteligencia artificial', 'next.js'],
  metadataBase: new URL(APP_URL),
  openGraph: {
    siteName: 'Simplemente',
    locale: 'es_UY',
    type: 'website',
    url: APP_URL,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Simplemente — Agencia Web con IA para Uruguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simplemente — Agencia Web con IA para Uruguay',
    description: 'Creamos páginas web y sistemas completos con IA para Uruguay.',
    images: ['/opengraph-image.png'],
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
