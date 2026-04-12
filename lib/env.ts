/**
 * Environment variable validation.
 * Called at server startup via instrumentation.ts.
 * In production throws on missing vars to prevent a broken deploy from serving traffic.
 */

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const DEMO_PATTERNS = ['placeholder', 'your-', 'tu-', 'YOUR_', 'CHANGE_ME']

function isPlaceholder(value: string): boolean {
  return DEMO_PATTERNS.some((p) => value.includes(p))
}

export function validateEnv(): void {
  const missing: string[] = []

  for (const key of REQUIRED_VARS) {
    const val = process.env[key]
    if (!val || isPlaceholder(val)) {
      missing.push(key)
    }
  }

  if (missing.length === 0) return

  const message = [
    '[Simplemente] Faltan variables de entorno requeridas:',
    ...missing.map((k) => `  - ${k}`),
    '',
    'Actualizá tu .env.local con los valores reales.',
  ].join('\n')

  if (process.env.NODE_ENV === 'production') {
    throw new Error(message)
  } else {
    console.warn(message)
    console.warn('[Simplemente] Modo demo activado — funciones reales deshabilitadas.')
  }
}
