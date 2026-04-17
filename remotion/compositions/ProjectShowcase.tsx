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
  projectName: string;
  clientName: string;
  description: string;
  tags: string[];
  primaryColor: string;
};

const Tag: React.FC<{ label: string; color: string; delay: number }> = ({ label, color, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [delay, delay + 15], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 6,
        padding: '6px 16px',
        fontSize: 22,
        fontWeight: 500,
        opacity,
        transform: `translateY(${y}px)`,
        display: 'inline-block',
        margin: '0 8px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {label}
    </span>
  );
};

export const ProjectShowcase: React.FC<Props> = ({
  projectName,
  clientName,
  description,
  tags,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleX = interpolate(frame, [0, 25], [-40, 0], { extrapolateRight: 'clamp' });

  const clientOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const descOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const dividerWidth = interpolate(frame, [15, 50], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const globalOpacity = interpolate(frame, [400, 450], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        padding: '80px 120px',
        opacity: globalOpacity,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Borde izquierdo animado */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '10%',
          width: 6,
          height: `${dividerWidth * 20}%`,
          backgroundColor: primaryColor,
          borderRadius: '0 4px 4px 0',
          transition: 'height 0.3s',
        }}
      />

      {/* Cliente */}
      <p
        style={{
          color: primaryColor,
          fontSize: 28,
          fontWeight: 600,
          margin: '0 0 16px 0',
          opacity: clientOpacity,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {clientName}
      </p>

      {/* Título del proyecto */}
      <h1
        style={{
          color: '#ffffff',
          fontSize: 80,
          fontWeight: 800,
          margin: '0 0 32px 0',
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          lineHeight: 1.1,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {projectName}
      </h1>

      {/* Descripción */}
      <p
        style={{
          color: '#cbd5e1',
          fontSize: 32,
          fontWeight: 300,
          margin: '0 0 48px 0',
          maxWidth: 900,
          lineHeight: 1.5,
          opacity: descOpacity,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag, i) => (
          <Tag key={tag} label={tag} color={primaryColor} delay={80 + i * 10} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
