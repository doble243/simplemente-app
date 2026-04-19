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

const { fontFamily } = loadFont('normal', { weights: ['400', '600', '700'] });

// 6 input channels — 2 cols × 3 rows
const SOURCES = [
  { id: 'web',   icon: '🌐', label: 'Lead Web',   detail: 'simplemente.uy/contacto', badge: 'Nuevo',    bColor: T.accent,  bBg: T.accentBg,  col: 0, row: 0, delay: 18 },
  { id: 'wa',    icon: '💬', label: 'WhatsApp',   detail: '+598 99 123 456',          badge: 'Sin leer', bColor: T.success, bBg: T.successBg, col: 0, row: 1, delay: 32 },
  { id: 'ref',   icon: '👥', label: 'Referido',   detail: 'Cliente: Martínez',        badge: 'Cálido',   bColor: T.amber,   bBg: T.amberBg,   col: 0, row: 2, delay: 46 },
  { id: 'email', icon: '📧', label: 'Email',      detail: 'info@ruizasociados.com',   badge: 'Nuevo',    bColor: T.violet,  bBg: T.violetBg,  col: 1, row: 0, delay: 25 },
  { id: 'ig',    icon: '📸', label: 'Instagram',  detail: '@ruiz_empresas',           badge: 'DM',       bColor: T.pink,    bBg: T.pinkBg,    col: 1, row: 1, delay: 39 },
  { id: 'proj',  icon: '🗂️', label: 'Proyecto',  detail: 'Bergara & Co.',            badge: 'Activo',   bColor: T.sky,     bBg: T.skyBg,     col: 1, row: 2, delay: 53 },
];

const CARD_W = 460;
const CARD_H = 86;
const COL_GAP = 100;
const ROW_GAP = 28;
const GRID_LEFT = (1920 - CARD_W * 2 - COL_GAP) / 2; // = 450
const COL_X = [GRID_LEFT, GRID_LEFT + CARD_W + COL_GAP];

// 3 rows, vertically centered in space below header (y>215)
const GRID_TOP = 215 + ((1080 - 215 - (CARD_H * 3 + ROW_GAP * 2)) / 2);
const ROW_Y = [
  GRID_TOP,
  GRID_TOP + CARD_H + ROW_GAP,
  GRID_TOP + (CARD_H + ROW_GAP) * 2,
];

export const SceneInput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const exitAlpha = interpolate(frame, [fps * 4.5, fps * 5], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily, opacity: exitAlpha }}>

      {/* ── Section header ── */}
      <div style={{ position: 'absolute', left: 80, top: 58, opacity: headerIn }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.accent,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          01 / Entrada
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>
          Señales entrantes al sistema
        </div>
        <div style={{ marginTop: 14, fontSize: 20, color: T.textMuted }}>
          Leads, mensajes y proyectos llegan desde múltiples canales
        </div>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', left: 80, right: 80, top: 210,
        height: 1, background: T.border, opacity: headerIn,
      }} />

      {/* ── Source cards ── */}
      {SOURCES.map((src) => {
        const s = spring({ frame: frame - src.delay, fps, config: { damping: 22, stiffness: 130 } });
        const startX = src.col === 0 ? -CARD_W - 60 : 1920 + 60;
        const tx = interpolate(s, [0, 1], [startX, COL_X[src.col]]);
        const alpha = interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

        return (
          <div key={src.id} style={{
            position: 'absolute',
            left: tx,
            top: ROW_Y[src.row],
            width: CARD_W,
            height: CARD_H,
            background: T.card,
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
            opacity: alpha,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 20,
            paddingRight: 20,
            gap: 16,
            overflow: 'hidden',
          }}>
            {/* Accent stripe */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 4, borderRadius: '14px 0 0 14px',
              background: src.bColor,
            }} />

            {/* Icon */}
            <div style={{
              marginLeft: 8,
              fontSize: 30,
              lineHeight: 1,
              width: 40,
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {src.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 3 }}>
                {src.label}
              </div>
              <div style={{
                fontSize: 13, color: T.textMuted,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {src.detail}
              </div>
            </div>

            {/* Badge */}
            <div style={{
              flexShrink: 0,
              padding: '4px 12px',
              borderRadius: 100,
              background: src.bBg,
              fontSize: 12,
              fontWeight: 600,
              color: src.bColor,
            }}>
              {src.badge}
            </div>
          </div>
        );
      })}

      {/* SFX per card */}
      {SOURCES.map((src) => (
        <Sequence key={src.id + '_sfx'} from={src.delay} durationInFrames={8} layout="none">
          <Audio src="https://remotion.media/switch.wav" volume={0.18} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
