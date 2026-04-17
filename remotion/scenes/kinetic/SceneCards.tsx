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

const { fontFamily } = loadFont('normal', { weights: ['400', '600', '700'] });

// Service cards — back-to-front order so front card lands on top
const CARDS = [
  {
    title: 'SEO',
    desc: 'Primeros en Google',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    delay: 0,
    stackY: -44,
    stackScale: 0.88,
    stackAlpha: 0.55,
    zIndex: 1,
  },
  {
    title: 'E-commerce',
    desc: 'MercadoPago integrado',
    icon: '🛒',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    delay: 10,
    stackY: -22,
    stackScale: 0.94,
    stackAlpha: 0.75,
    zIndex: 2,
  },
  {
    title: 'Landing Page',
    desc: 'Desde $5.000 UYU',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #a855f7 100%)',
    delay: 22,
    stackY: 0,
    stackScale: 1,
    stackAlpha: 1,
    zIndex: 3,
  },
];

const CARD_W = 500;
const CARD_H = 300;

// Stats that appear below the card stack
const STATS = [
  { value: '28+', label: 'proyectos' },
  { value: '98%', label: 'satisfacción' },
  { value: '14 días', label: 'entrega' },
];

export const SceneCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2 - 40;

  // Scene enter
  const sceneAlpha = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit
  const exitAlpha = interpolate(frame, [132, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Stats appear after cards settle
  const statsAlpha = interpolate(frame, [75, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const statsY = interpolate(frame, [75, 92], [22, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CTA line
  const ctaAlpha = interpolate(frame, [105, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #020D18 0%, #080818 100%)',
        fontFamily,
        opacity: sceneAlpha * exitAlpha,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          left: cx - 320,
          top: cy - 220,
          width: 640,
          height: 440,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Card stack */}
      {CARDS.map((card) => {
        const cardSpring = spring({
          frame: frame - card.delay,
          fps,
          config: { damping: 18, stiffness: 70 },
        });

        // Cards fly in from below
        const entryY = (1 - cardSpring) * 300;
        const finalY = cy - CARD_H / 2 + card.stackY;
        const posY = finalY + entryY;
        const posX = cx - (CARD_W * card.stackScale) / 2;

        const currentScale = 0.6 + cardSpring * (card.stackScale - 0.6);
        const currentAlpha = cardSpring * card.stackAlpha;

        return (
          <div
            key={card.title}
            style={{
              position: 'absolute',
              left: posX,
              top: posY,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 28,
              background: card.gradient,
              transform: `scale(${currentScale})`,
              transformOrigin: 'center top',
              opacity: currentAlpha,
              zIndex: card.zIndex,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              padding: 44,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>{card.icon}</div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {card.desc}
            </div>
          </div>
        );
      })}

      {/* Stats row */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 80,
          opacity: statsAlpha,
          transform: `translateY(${statsY}px)`,
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 6,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTA line */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: ctaAlpha,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#818cf8',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          simplemente.uy →
        </span>
      </div>
    </AbsoluteFill>
  );
};
