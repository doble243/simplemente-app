/**
 * Next.js instrumentation hook — runs once at server startup.
 * Used to validate environment variables before accepting any requests.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env')
    validateEnv()
  }
}
