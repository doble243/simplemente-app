import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://simplemente.uy'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/clientes',
          '/facturas',
          '/leads',
          '/proyectos',
          '/mensajes',
          '/archivos',
          '/reportes',
          '/configuracion',
          '/portal',
          '/login',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
