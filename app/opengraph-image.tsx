import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const alt = 'Simplemente — Agencia Web con IA para Uruguay'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #0f0e1a 0%, #1a1730 60%, #0d0c18 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 300,
            background: 'radial-gradient(ellipse, rgba(91,79,232,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 96,
            height: 96,
            background: '#5B4FE8',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            fontWeight: 900,
            color: 'white',
            marginBottom: 32,
            boxShadow: '0 20px 60px rgba(91,79,232,0.4)',
          }}
        >
          S
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: 'white',
            letterSpacing: -3,
            marginBottom: 16,
          }}
        >
          Simplemente
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: 0,
          }}
        >
          Agencia Web con IA · Uruguay
        </div>

        {/* Bottom bar accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #5B4FE8, #8B7FF8, #5B4FE8)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
