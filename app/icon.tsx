import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#5B4FE8',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 900,
          color: 'white',
          letterSpacing: -1,
          fontFamily: 'sans-serif',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
