import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="flex h-14 items-center border-b border-border/50 bg-card/50 px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <img src="/logo.svg" alt="Simplemente" width={28} height={28} />
          Simplemente
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  )
}
