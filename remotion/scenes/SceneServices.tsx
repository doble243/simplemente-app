import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['400', '600', '700'] });

const services = [
  { icon: '⚡', label: 'Landing Page', desc: 'Desde $5.000 UYU', color: '#6366f1' },
  { icon: '🛒', label: 'E-commerce', desc: 'MercadoPago integrado', color: '#8b5cf6' },
  { icon: '🤖', label: 'Web App + IA', desc: 'Sistemas inteligentes', color: '#a855f7' },
  { icon: '🔍', label: 'SEO', desc: 'Primeros en Google', color: '#7c3aed' },
];

const ServiceCard: React.FC<{ service: typeof services[0]; index: number; frame: number }> = ({ service, index, frame }) => {
  const delay = index * 12;
  const start = 10 + delay;

  const y = interpolate(frame, [start, start + 30], [50, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [start, start + 25], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const borderProgress = interpolate(frame, [start + 20, start + 50], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      flex: 1,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,${0.06 + borderProgress * 0.08})`,
      borderRadius: 20,
      padding: 40,
      transform: `translateY(${y}px)`,
      opacity,
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>{service.icon}</div>
      <div style={{ color: '#ffffff', fontSize: 30, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
        {service.label}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 22 }}>
        {service.desc}
      </div>
      <div style={{
        marginTop: 28,
        height: 2,
        width: `${borderProgress * 100}%`,
        background: `linear-gradient(90deg, ${service.color}, transparent)`,
        borderRadius: 1,
      }} />
    </div>
  );
};

export const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp',
  });
  const headerX = interpolate(frame, [0, 20], [-20, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp',
  });

  const exitOpacity = interpolate(frame, [130, 150], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #020D18 0%, #0a1628 100%)',
      padding: '60px 100px',
      fontFamily,
      opacity: exitOpacity,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ marginBottom: 60, opacity: headerOpacity, transform: `translateX(${headerX}px)` }}>
          <p style={{ color: '#6366f1', fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            Servicios
          </p>
          <h2 style={{ color: '#ffffff', fontSize: 72, fontWeight: 900, margin: 0, lineHeight: 1 }}>
            ¿Qué hacemos?
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 24, flex: 1 }}>
          {services.map((s, i) => (
            <ServiceCard key={s.label} service={s} index={i} frame={frame} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
