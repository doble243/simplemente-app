import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';

type Props = {
  agencyName: string;
  tagline: string;
  primaryColor: string;
};

export const AgencyIntro: React.FC<Props> = ({ agencyName, tagline, primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Nombre: aparece en frame 0-20
  const nameOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const nameScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });

  // Tagline: aparece en frame 40-60
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [40, 60], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Línea decorativa: aparece en frame 30-50
  const lineWidth = interpolate(frame, [30, 70], [0, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out al final (frames 260-300)
  const globalOpacity = interpolate(frame, [260, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: globalOpacity,
      }}
    >
      {/* Fondo con gradiente sutil */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor}22 0%, transparent 70%)`,
        }}
      />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* Nombre de la agencia */}
        <h1
          style={{
            color: '#ffffff',
            fontSize: 96,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-2px',
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {agencyName}
        </h1>

        {/* Línea decorativa */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: primaryColor,
            margin: '24px auto',
            borderRadius: 2,
          }}
        />

        {/* Tagline */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: 36,
            margin: 0,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 300,
          }}
        >
          {tagline}
        </p>
      </div>
    </AbsoluteFill>
  );
};
