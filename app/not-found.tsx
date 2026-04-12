import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center bg-background">
      <p className="text-8xl font-black text-primary/15 leading-none select-none">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          La página que buscás no existe o fue movida.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-opacity hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
