import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['300', '700', '900'] });

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fondo: grid sutil que se expande
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.06], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp',
  });

  // Eyebrow "AGENCIA DIGITAL · URUGUAY"
  const eyebrowX = interpolate(frame, [5, 35], [-30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const eyebrowOpacity = interpolate(frame, [5, 35], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Título principal — palabra por palabra
  const words = ['Tu', 'negocio', 'en', 'internet,'];
  const wordDelay = 8;

  // Tagline typewriter
  const tagline = 'simplemente.';
  const taglineStart = 55;
  const charsToShow = Math.floor(
    interpolate(frame, [taglineStart, taglineStart + tagline.length * 2.5], [0, tagline.length], {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
  );
  const cursor = frame > taglineStart + tagline.length * 2.5 + 5
    ? (Math.floor(frame / 16) % 2 === 0 ? '▌' : '')
    : '▌';

  // Línea decorativa
  const lineWidth = interpolate(frame, [40, 75], [0, 100], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Exit fade
  const globalOpacity = interpolate(frame, [100, 120], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #020D18 0%, #0a1628 100%)',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '0 120px',
        opacity: globalOpacity,
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: gridOpacity,
      }} />

      {/* Gradiente radial */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <p style={{
          color: '#6366f1',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          margin: '0 0 32px 0',
          opacity: eyebrowOpacity,
          transform: `translateX(${eyebrowX}px)`,
        }}>
          Agencia Digital · Uruguay
        </p>

        {/* Título — palabras staggered */}
        <div style={{ margin: '0 0 16px 0' }}>
          {words.map((word, i) => {
            const start = 15 + i * wordDelay;
            const wOpacity = interpolate(frame, [start, start + 18], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const wY = interpolate(frame, [start, start + 18], [24, 0], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <span key={word} style={{
                display: 'inline-block',
                fontSize: 96,
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1,
                marginRight: 24,
                opacity: wOpacity,
                transform: `translateY(${wY}px)`,
              }}>
                {word}
              </span>
            );
          })}
        </div>

        {/* Línea + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{
            width: lineWidth,
            height: 3,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            borderRadius: 2,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 96,
            fontWeight: 300,
            color: '#6366f1',
            lineHeight: 1,
          }}>
            {tagline.slice(0, charsToShow)}<span style={{ opacity: 0.7 }}>{cursor}</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
