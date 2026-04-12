import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#5B4FE8',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 110,
          fontWeight: 900,
          color: 'white',
          letterSpacing: -4,
          fontFamily: 'sans-serif',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
