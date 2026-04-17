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

const { fontFamily } = loadFont('normal', { weights: ['400', '900'] });

// Pre-computed particle spread — various angles, distances, colours
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (i % 4) * 0.3;
  const distance = 120 + (i % 6) * 55;
  const colors = ['#6366f1', '#a855f7', '#818cf8', '#c084fc', '#ffffff'];
  return {
    angle,
    distance,
    size: 4 + (i % 4) * 3,
    color: colors[i % colors.length],
    delay: (i % 6) * 2,
  };
});

// Concentric rings — different radii contract at staggered delays
const RINGS = [
  { startRadius: 320, delay: 0,  color: 'rgba(99,102,241,0.6)' },
  { startRadius: 240, delay: 4,  color: 'rgba(168,85,247,0.5)' },
  { startRadius: 160, delay: 8,  color: 'rgba(99,102,241,0.4)' },
];

export const SceneBrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Scene enter fade
  const sceneAlpha = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit
  const exitAlpha = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Brand name spring — starts at frame 22
  const nameSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const nameScale = 0.3 + nameSpring * 0.7;
  const nameAlpha = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline appears after brand settles
  const taglineAlpha = interpolate(frame, [44, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#020D18',
        fontFamily,
        opacity: sceneAlpha * exitAlpha,
      }}
    >
      {/* Ambient radial glow behind brand */}
      <div
        style={{
          position: 'absolute',
          left: cx - 300,
          top: cy - 200,
          width: 600,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          opacity: nameAlpha,
        }}
      />

      {/* Contracting rings */}
      {RINGS.map((ring, ri) => {
        const localFrame = frame - ring.delay;
        const progress = interpolate(localFrame, [0, 28], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        });
        const radius = ring.startRadius * (1 - progress);
        const ringAlpha = interpolate(progress, [0, 0.7, 1], [1, 0.8, 0]);
        if (radius < 4) return null;
        return (
          <div
            key={ri}
            style={{
              position: 'absolute',
              left: cx - radius,
              top: cy - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: `2px solid ${ring.color}`,
              opacity: ringAlpha,
            }}
          />
        );
      })}

      {/* Particle burst */}
      {PARTICLES.map((p, pi) => {
        const pFrame = frame - 18 - p.delay;
        const pSpring = spring({
          frame: pFrame,
          fps,
          config: { damping: 22, stiffness: 55 },
        });
        const dist = pSpring * p.distance;
        const px = cx + Math.cos(p.angle) * dist;
        const py = cy + Math.sin(p.angle) * dist;
        const pAlpha = interpolate(pFrame, [0, 8, 45, 65], [0, 1, 0.9, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={pi}
            style={{
              position: 'absolute',
              left: px - p.size / 2,
              top: py - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity: pAlpha,
            }}
          />
        );
      })}

      {/* Brand name + tagline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${nameScale})`,
          opacity: nameAlpha,
        }}
      >
        <div
          style={{
            fontSize: 116,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          simplemente.
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: taglineAlpha,
          }}
        >
          diseño web que convierte
        </div>
      </div>
    </AbsoluteFill>
  );
};
