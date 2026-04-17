import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['300', '700', '900'] });

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Empezá hoy." — word highlight en "hoy."
  const titleOpacity = interpolate(frame, [5, 30], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [5, 30], [30, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp',
  });

  // Highlight "hoy." — scaleX animado desde la izquierda
  const highlightScale = interpolate(frame, [35, 55], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Subtítulo
  const subOpacity = interpolate(frame, [50, 70], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [50, 70], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // URL badge
  const badgeScale = spring({ frame: frame - 65, fps, config: { damping: 14, stiffness: 120 } });
  const badgeOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Logo pulse
  const logoPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1], [0.95, 1.05]
  );

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #020D18 0%, #0a1628 100%)',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily,
      overflow: 'hidden',
    }}>
      {/* Glow central */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        transform: `scale(${logoPulse})`,
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <p style={{
          color: '#6366f1', fontSize: 22, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          margin: '0 0 32px 0',
          opacity: titleOpacity,
        }}>
          ¿Listo para crecer?
        </p>

        {/* Título con word-highlight */}
        <div style={{
          fontSize: 108,
          fontWeight: 900,
          lineHeight: 1,
          margin: '0 0 8px 0',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          <span style={{ color: '#ffffff' }}>Empezá </span>
          {/* Word highlight en "hoy." */}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              position: 'absolute',
              inset: '-4px -8px',
              background: '#6366f1',
              borderRadius: 8,
              transformOrigin: 'left center',
              transform: `scaleX(${highlightScale})`,
              zIndex: 0,
            }} />
            <span style={{ position: 'relative', zIndex: 1, color: '#ffffff' }}>hoy.</span>
          </span>
        </div>

        {/* Subtítulo */}
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 32,
          fontWeight: 300,
          margin: '40px 0 48px 0',
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}>
          Tu página lista en días. Precio accesible para Uruguay.
        </p>

        {/* URL badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 100,
          padding: '16px 40px',
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
        }}>
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px #4ade80',
          }} />
          <span style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
            simplemente.com.uy
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
