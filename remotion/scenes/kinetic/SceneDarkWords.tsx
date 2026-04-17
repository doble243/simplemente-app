import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['400', '700', '900'] });

// Narrativa de ventas: el dolor del cliente → llamado a la acción.
// 4 beats × 37 frames = 148 frames. Escena = 150 frames (5s).
const BEATS = [
  { text: '¿te googlea?', weight: 400, spacing: '0.04em',  size: 108 },
  { text: '¿qué ve?',     weight: 400, spacing: '0.04em',  size: 120 },
  { text: 'nada.',        weight: 900, spacing: '-0.02em', size: 180 },
  { text: 'cambiá.',      weight: 700, spacing: '-0.01em', size: 148 },
];
const BEAT_DURATION = 37;

// Floating outline shapes — appear after the first word
const SHAPES = [
  { char: '○', left: '12%', top: '15%', size: 40, speed: 1.0, phase: 0 },
  { char: '□', left: '82%', top: '17%', size: 32, speed: 0.8, phase: 1.2 },
  { char: '△', left: '9%',  top: '76%', size: 36, speed: 0.9, phase: 2.5 },
  { char: '+', left: '87%', top: '73%', size: 38, speed: 1.1, phase: 3.8 },
];

export const SceneDarkWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shapes fade in after first word settles
  const shapesAlpha = interpolate(frame, [38, 55], [0, 0.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit
  const sceneAlpha = interpolate(frame, [132, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{ background: '#060606', fontFamily, opacity: sceneAlpha }}
    >
      {/* Geometric shapes */}
      {SHAPES.map((s, i) => {
        const dx = Math.sin(frame * 0.018 * s.speed + s.phase) * 10;
        const dy = Math.cos(frame * 0.014 * s.speed + s.phase) * 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              fontSize: s.size,
              fontWeight: 100,
              color: `rgba(255,255,255,${shapesAlpha})`,
              lineHeight: 1,
              transform: `translate(${dx}px, ${dy}px)`,
              userSelect: 'none',
            }}
          >
            {s.char}
          </div>
        );
      })}

      {/* Words */}
      {BEATS.map((beat, i) => {
        const wordStart = i * BEAT_DURATION;
        const local = frame - wordStart;

        // Only render the active word (±5 frame buffer)
        if (local < -2 || local > BEAT_DURATION + 2) return null;

        // Enter: scale + translateY spring
        const enterSpring = spring({
          frame: local,
          fps,
          config: { damping: 24, stiffness: 200 },
        });

        // Exit: quick fade + scale-up
        const exitAlpha = interpolate(local, [BEAT_DURATION - 8, BEAT_DURATION], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const exitScale = interpolate(local, [BEAT_DURATION - 8, BEAT_DURATION], [1, 1.1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Enter opacity
        const enterAlpha = interpolate(local, [0, 7], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const scale = (0.82 + enterSpring * 0.18) * exitScale;
        const translateY = (1 - Math.min(1, enterSpring)) * 50;
        const opacity = enterAlpha * exitAlpha;

        return (
          <div
            key={beat.text}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              transform: `scale(${scale}) translateY(${translateY}px)`,
            }}
          >
            <span
              style={{
                fontSize: beat.size,
                fontWeight: beat.weight,
                color: '#ffffff',
                letterSpacing: beat.spacing,
                lineHeight: 1,
              }}
            >
              {beat.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
