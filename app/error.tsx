'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Algo salió mal</h1>
          <p style={{ color: '#666', maxWidth: 360, margin: 0 }}>
            Ocurrió un error inesperado. Podés intentar de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#5B4FE8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
