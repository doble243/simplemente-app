import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  Sequence,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { T } from '../../theme';

const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700'] });

const NAV_ITEMS = [
  { label: 'Contactos', active: true },
  { label: 'Proyectos', active: false },
  { label: 'Tareas', active: false },
  { label: 'Reportes', active: false },
];

const TABLE_ROWS = [
  { canal: '🌐', canalLabel: 'Web',       name: 'Diego Fernández',  email: 'diego@dftech.uy',      estado: 'Nuevo',      estadoColor: T.accent,  estadoBg: T.accentBg,  asignado: 'Ana M.' },
  { canal: '📧', canalLabel: 'Email',     name: 'Laura Sosa',       email: 'lsosa@consultora.com', estado: 'En contacto', estadoColor: T.sky,     estadoBg: T.skyBg,     asignado: 'Carlos R.' },
  { canal: '💬', canalLabel: 'WhatsApp',  name: 'Martín Ruiz',      email: '+598 91 234 567',      estado: 'Cálido',      estadoColor: T.amber,   estadoBg: T.amberBg,   asignado: 'Ana M.' },
  { canal: '📸', canalLabel: 'Instagram', name: 'Valentina López',  email: '@vlopez_diseño',       estado: 'Nuevo',       estadoColor: T.accent,  estadoBg: T.accentBg,  asignado: 'Sin asignar' },
  { canal: '👥', canalLabel: 'Referido',  name: 'Roberto Bergara',  email: 'rbergara@bergara.uy',  estado: 'Calificado',  estadoColor: T.success, estadoBg: T.successBg, asignado: 'Carlos R.' },
  { canal: '📋', canalLabel: 'Form.',     name: 'Camila Herrera',   email: 'camila.h@gmail.com',   estado: 'Nuevo',       estadoColor: T.accent,  estadoBg: T.accentBg,  asignado: 'Sin asignar' },
];

const TOPBAR_H = 56;
const SIDEBAR_W = 220;
const ROW_H = 62;
const TABLE_HEAD_H = 44;

export const SceneCentralization: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard fades in
  const dashIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const exitAlpha = interpolate(frame, [fps * 6.5, fps * 7], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Section label above dashboard
  const labelIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const labelY = interpolate(frame, [0, 20], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Counter badge in header pulses in
  const counterIn = interpolate(frame, [fps * 3, fps * 3.5], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const contentLeft = SIDEBAR_W;
  const tableTop = TOPBAR_H + 72 + TABLE_HEAD_H; // topbar + content header + table header

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily, opacity: exitAlpha }}>

      {/* ── Section label (floating above dashboard) ── */}
      <div style={{
        position: 'absolute', left: 80, top: 12,
        opacity: labelIn,
        transform: `translateY(${labelY}px)`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.accent,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          02 / Centralización
        </div>
        <div style={{ width: 1, height: 14, background: T.border }} />
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Todo en un solo lugar
        </div>
      </div>

      {/* ── Dashboard shell ── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: 52, bottom: 0,
        opacity: dashIn,
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Top bar */}
        <div style={{
          height: TOPBAR_H,
          background: T.card,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          paddingRight: 24,
          gap: 0,
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{
            width: SIDEBAR_W - 24,
            fontSize: 16, fontWeight: 700, color: T.text,
            letterSpacing: '-0.01em',
          }}>
            simplemente<span style={{ color: T.accent }}>.</span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map((n) => (
              <div key={n.label} style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: n.active ? 600 : 400,
                color: n.active ? T.accent : T.textMuted,
                background: n.active ? T.accentBg : 'transparent',
              }}>
                {n.label}
              </div>
            ))}
          </div>

          {/* Spacer + avatar */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>A</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <div style={{
            width: SIDEBAR_W,
            background: T.bg,
            borderRight: `1px solid ${T.border}`,
            paddingTop: 20,
            flexShrink: 0,
          }}>
            {['Contactos', 'Proyectos', 'Tareas', 'Reportes', 'Configuración'].map((item, i) => (
              <div key={item} style={{
                padding: '10px 20px',
                fontSize: 13.5,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? T.accent : T.textMuted,
                background: i === 0 ? T.accentBg : 'transparent',
                borderLeft: `3px solid ${i === 0 ? T.accent : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 15 }}>
                  {['👥', '🗂️', '✅', '📊', '⚙️'][i]}
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 28, paddingTop: 24, overflow: 'hidden' }}>

            {/* Content header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              marginBottom: 20, gap: 12,
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: T.text }}>
                Contactos
              </div>
              {/* Counter badge */}
              <div style={{
                padding: '3px 12px', borderRadius: 100,
                background: T.accentBg, fontSize: 13, fontWeight: 600,
                color: T.accent, opacity: counterIn,
              }}>
                6 centralizados
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {['Filtrar', 'Exportar'].map((btn) => (
                  <div key={btn} style={{
                    padding: '7px 16px', borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    fontSize: 13, fontWeight: 500, color: T.textMuted,
                    background: T.card,
                  }}>
                    {btn}
                  </div>
                ))}
                <div style={{
                  padding: '7px 18px', borderRadius: 8,
                  background: T.accent,
                  fontSize: 13, fontWeight: 600, color: '#fff',
                }}>
                  + Nuevo
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: T.card,
              borderRadius: 14,
              border: `1px solid ${T.border}`,
              overflow: 'hidden',
              boxShadow: T.shadow,
            }}>
              {/* Table header */}
              <div style={{
                display: 'flex',
                height: TABLE_HEAD_H,
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                alignItems: 'center',
                paddingLeft: 20, paddingRight: 20,
              }}>
                {['Canal', 'Nombre / Contacto', 'Estado', 'Asignado'].map((col, ci) => (
                  <div key={col} style={{
                    flex: [0.5, 2.5, 1, 1][ci],
                    fontSize: 12, fontWeight: 600, color: T.textDim,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {col}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {TABLE_ROWS.map((row, ri) => {
                const rowDelay = 25 + ri * 14;
                const rowSpring = spring({
                  frame: frame - rowDelay,
                  fps,
                  config: { damping: 24, stiffness: 150 },
                });
                const rowY = interpolate(rowSpring, [0, 1], [24, 0]);
                const rowAlpha = interpolate(rowSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                return (
                  <div key={ri} style={{
                    display: 'flex',
                    height: ROW_H,
                    alignItems: 'center',
                    paddingLeft: 20, paddingRight: 20,
                    borderBottom: ri < TABLE_ROWS.length - 1 ? `1px solid ${T.border}` : 'none',
                    transform: `translateY(${rowY}px)`,
                    opacity: rowAlpha,
                    background: ri % 2 === 0 ? T.card : T.bg,
                  }}>
                    {/* Canal */}
                    <div style={{ flex: 0.5, fontSize: 20 }}>
                      {row.canal}
                    </div>
                    {/* Name */}
                    <div style={{ flex: 2.5 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text }}>{row.name}</div>
                      <div style={{ fontSize: 12, color: T.textMuted }}>{row.email}</div>
                    </div>
                    {/* Estado */}
                    <div style={{ flex: 1 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 100,
                        background: row.estadoBg, fontSize: 12,
                        fontWeight: 600, color: row.estadoColor,
                      }}>
                        {row.estado}
                      </span>
                    </div>
                    {/* Asignado */}
                    <div style={{
                      flex: 1, fontSize: 13,
                      color: row.asignado === 'Sin asignar' ? T.textDim : T.textMuted,
                      fontWeight: row.asignado === 'Sin asignar' ? 400 : 500,
                    }}>
                      {row.asignado}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SFX: whoosh on entry */}
      <Sequence from={0} durationInFrames={20} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={0.15} />
      </Sequence>
    </AbsoluteFill>
  );
};
