import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-eval in dev; acceptable for v1
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://supabase.co https://image.thum.io",
      "media-src 'self' blob:",
      // In dev, also allow local Supabase (127.0.0.1:543xx)
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com${
        process.env.NODE_ENV === 'development'
          ? ` ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} ws://127.0.0.1:* http://127.0.0.1:*`
          : ''
      }`,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  // Node.js-only packages — must not be bundled by webpack
  serverExternalPackages: [
    '@react-pdf/renderer',
    'remotion',
    '@remotion/renderer',
    '@remotion/bundler',
    '@remotion/cli',
  ],


  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
