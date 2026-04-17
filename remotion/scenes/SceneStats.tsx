import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['400', '700', '900'] });

const stats = [
  { label: 'Proyectos\nEntregados', value: 28, suffix: '+', color: '#6366f1' },
  { label: 'Satisfacción\nCliente', value: 98, suffix: '%', color: '#8b5cf6' },
  { label: 'Días Promedio\nde Entrega', value: 14, suffix: '', color: '#a855f7' },
  { label: 'Clientes\nActivos', value: 12, suffix: '', color: '#7c3aed' },
];

const StatBar: React.FC<{ stat: typeof stats[0]; index: number; frame: number; fps: number }> = ({ stat, index, frame, fps }) => {
  const delay = index * 8;

  const progress = spring({
    frame: frame - delay - 15,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const labelOpacity = interpolate(frame, [delay + 5, delay + 25], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const displayValue = Math.round(stat.value * progress);
  const barWidth = `${Math.min(progress * 100, 100)}%`;

  return (
    <div style={{ marginBottom: 48, opacity: labelOpacity }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 400, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
          {stat.label}
        </span>
        <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: stat.color }}>
          {displayValue}{stat.suffix}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: barWidth,
          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`,
          borderRadius: 3,
          transition: 'none',
        }} />
      </div>
    </div>
  );
};

export const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #020D18 0%, #0a1628 100%)',
      padding: '60px 180px',
      fontFamily,
      opacity: exitOpacity,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 100% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 64, opacity: headerOpacity }}>
          <p style={{ color: '#6366f1', fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            Resultados reales
          </p>
          <h2 style={{ color: '#ffffff', fontSize: 72, fontWeight: 900, margin: 0, lineHeight: 1 }}>
            Los números hablan.
          </h2>
        </div>

        {stats.map((stat, i) => (
          <StatBar key={stat.label} stat={stat} index={i} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
