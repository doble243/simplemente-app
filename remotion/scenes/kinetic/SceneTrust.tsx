/**
 * SceneTrust — Escena de cierre orientada a conversión.
 *
 * Jerarquía:
 *  1. Badge social proof   — "28+ proyectos entregados"
 *  2. Promesa hero         — "14 días." (grande, imposible ignorar)
 *  3. Sub-contexto         — "Tu web lista en"
 *  4. Precio ancla         — "desde $3.900 UYU"
 *  5. Clientes reales      — ticker horizontal
 *  6. CTA primario         — "Quiero mi web →" con glow pulsante
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['400', '600', '700', '900'] });

const CLIENTS = [
  'Contamina UY',
  'WorldCase',
  'GDN Studio',
  'mente.web',
  'Bienestar UY',
];

export const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── opacidades globales ──────────────────────────────────────
  const sceneIn  = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOut = interpolate(frame, [142, 160], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── 1. Badge ─────────────────────────────────────────────────
  const badgeSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 120 } });
  const badgeAlpha  = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── 2. Número héroe "14 días." ───────────────────────────────
  const numSpring = spring({ frame: frame - 16, fps, config: { damping: 16, stiffness: 80 } });
  const numAlpha  = interpolate(frame, [16, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const numScale  = 0.35 + numSpring * 0.65;

  // ── 3. Contexto "Tu web lista en" ────────────────────────────
  const contextAlpha = interpolate(frame, [42, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contextY     = interpolate(frame, [42, 56], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── 4. Precio ancla ──────────────────────────────────────────
  const priceAlpha = interpolate(frame, [56, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── 5. Ticker de clientes ────────────────────────────────────
  const tickerAlpha = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tickerX     = interpolate(frame, [72, 96], [120, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── 6. CTA ───────────────────────────────────────────────────
  const ctaSpring = spring({ frame: frame - 98, fps, config: { damping: 18, stiffness: 80 } });
  const ctaAlpha  = interpolate(frame, [98, 112], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Glow pulsante (sin estados — derivado del frame)
  const ctaGlow   = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.25, 0.55]);

  return (
    <AbsoluteFill style={{ background: '#020D18', fontFamily, opacity: sceneIn * sceneOut }}>

      {/* Resplandor ambiental */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '45%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 560,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>

        {/* ── Badge ── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          border: '1.5px solid rgba(99,102,241,0.55)',
          borderRadius: 100, padding: '10px 28px',
          marginBottom: 36,
          opacity: badgeAlpha,
          transform: `translateY(${(1 - badgeSpring) * -24}px)`,
        }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 26,
            fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            28+ proyectos entregados
          </span>
        </div>

        {/* ── Contexto + Número héroe ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 36, fontWeight: 400,
            color: 'rgba(255,255,255,0.42)',
            letterSpacing: '0.04em',
            marginBottom: 4,
            opacity: contextAlpha,
            transform: `translateY(${contextY}px)`,
          }}>
            Tu web lista en
          </div>
          <div style={{
            fontSize: 172, fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.04em', lineHeight: 0.88,
            transform: `scale(${numScale})`,
            opacity: numAlpha,
          }}>
            14 días.
          </div>
        </div>

        {/* ── Precio ancla ── */}
        <div style={{
          fontSize: 30, fontWeight: 400,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.08em',
          marginBottom: 52,
          opacity: priceAlpha,
        }}>
          desde $3.900 UYU
        </div>

        {/* ── Ticker clientes ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 28,
          marginBottom: 56,
          opacity: tickerAlpha,
          transform: `translateX(${tickerX}px)`,
        }}>
          {CLIENTS.map((c, i) => (
            <React.Fragment key={c}>
              <span style={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: 23, fontWeight: 400,
                letterSpacing: '0.02em',
              }}>
                {c}
              </span>
              {i < CLIENTS.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 20 }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 18,
          background: '#6366f1',
          borderRadius: 100, padding: '22px 60px',
          opacity: ctaAlpha,
          transform: `scale(${0.82 + ctaSpring * 0.18})`,
          boxShadow: `0 0 ${50 + ctaGlow * 40}px rgba(99,102,241,${ctaGlow}), 0 20px 60px rgba(0,0,0,0.4)`,
        }}>
          <span style={{ color: '#ffffff', fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Quiero mi web
          </span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 34 }}>→</span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
