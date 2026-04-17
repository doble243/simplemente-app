import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['900'] });

export const SceneAttention: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade-in
  const sceneAlpha = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit
  const exitAlpha = interpolate(frame, [48, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text arrives like it's flying in from lower-left — kinetic arrival
  // Low damping = overshoots slightly then settles (organic, energetic)
  const arrivalSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 50, mass: 0.8 },
  });

  // Rotation: arrives tilted ~25deg, overshoots to ~22deg
  const rotation = interpolate(arrivalSpring, [0, 1], [-8, 22]);

  // Scale: zooms out from 2× to 1 (feels like camera pulling back)
  const scale = interpolate(arrivalSpring, [0, 1], [2.2, 1]);

  // X offset: comes from left
  const translateX = interpolate(arrivalSpring, [0, 1], [-380, 20]);

  // Y offset: slight upward drift
  const translateY = interpolate(arrivalSpring, [0, 1], [80, -10]);

  // Motion blur clears as motion settles
  const blur = interpolate(arrivalSpring, [0, 0.6, 1], [12, 3, 0]);

  // Small circle marker (top-left corner — same shape as dark scene)
  const circleAlpha = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#f2f2f0',
        fontFamily,
        opacity: sceneAlpha * exitAlpha,
      }}
    >
      {/* Corner marker */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 90,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: '2px solid rgba(0,0,0,0.35)',
          opacity: circleAlpha,
        }}
      />

      {/* Main word */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <span
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: '#0a0a0a',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          ¿listo?
        </span>
      </div>
    </AbsoluteFill>
  );
};
