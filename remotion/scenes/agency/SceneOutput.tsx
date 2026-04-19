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
import { Typewriter } from '../../components/Typewriter';

const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700', '900'] });

const DELIVERABLES = [
  { icon: '📄', label: 'Propuesta_RuizAsoc_v3.pdf',  size: '2.1 MB', type: 'PDF',   color: T.accent,  delay: 60  },
  { icon: '🎨', label: 'Diseño_Web_Final.fig',         size: '8.4 MB', type: 'Figma', color: T.violet,  delay: 78  },
  { icon: '📋', label: 'Brief_Creativo.docx',          size: '412 KB', type: 'Word',  color: T.sky,     delay: 96  },
];

const ACTIVITY = [
  { text: 'Propuesta enviada automáticamente al cliente',  time: 'hace 12 min', icon: '📤' },
  { text: 'Archivos subidos al espacio del cliente',       time: 'hace 10 min', icon: '📁' },
  { text: 'Notificación por email y WhatsApp enviada',     time: 'hace 8 min',  icon: '🔔' },
  { text: 'Estado actualizado a "Entregado"',              time: 'hace 8 min',  icon: '✅' },
];

export const SceneOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const exitAlpha = interpolate(frame, [fps * 9.5, fps * 10], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Main delivery card springs in
  const cardSpring = spring({ frame: frame - 12, fps, config: { damping: 22, stiffness: 130 } });
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardAlpha = interpolate(cardSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // Progress bar: 0 → 100% over frames 30-90
  const progressVal = interpolate(frame, [30, 90], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // "COMPLETADO" badge appears when progress hits 100
  const completedIn = interpolate(frame, [88, 100], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Activity log entries
  const ACTIVITY_START = 110;

  // Logo + tagline at the end
  const LOGO_START = fps * 6; // 6s in
  const logoSpring = spring({ frame: frame - LOGO_START, fps, config: { damping: 20, stiffness: 120 } });
  const logoY = interpolate(logoSpring, [0, 1], [30, 0]);
  const logoAlpha = interpolate(logoSpring, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const taglineAlpha = interpolate(frame, [LOGO_START + 25, LOGO_START + 50], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Layout: split — left = client card, right = activity log
  const CARD_LEFT = 80;
  const CARD_WIDTH = 820;
  const ACTIVITY_LEFT = CARD_LEFT + CARD_WIDTH + 60;
  const ACTIVITY_WIDTH = 1920 - ACTIVITY_LEFT - 80;
  const CARD_TOP = 210;

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily, opacity: exitAlpha }}>

      {/* ── Section header ── */}
      <div style={{ position: 'absolute', left: 80, top: 36, opacity: headerIn }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.success,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          05 / Resultado
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, color: T.text, lineHeight: 1 }}>
          El cliente recibe claridad
        </div>
        <div style={{ marginTop: 10, fontSize: 18, color: T.textMuted }}>
          Entregables, estado y comunicación — todo automático
        </div>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', left: 80, right: 80, top: 164,
        height: 1, background: T.border, opacity: headerIn,
      }} />

      {/* ── Delivery card (left) ── */}
      <div style={{
        position: 'absolute',
        left: CARD_LEFT,
        top: CARD_TOP + cardY,
        width: CARD_WIDTH,
        background: T.card,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowLg,
        opacity: cardAlpha,
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${T.border}`,
          background: `linear-gradient(135deg, ${T.accentBg} 0%, ${T.violetBg} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 600, color: T.accent,
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
            }}>
              Vista del cliente
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>
              Rediseño Web — Ruiz & Asociados
            </div>
            <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>
              Proyecto #2024-047 · Entregado por simplemente.
            </div>
          </div>
          {/* Status badge */}
          <div style={{
            padding: '8px 18px', borderRadius: 100,
            background: T.successBg,
            border: `1.5px solid rgba(5,150,105,0.25)`,
            fontSize: 14, fontWeight: 700, color: T.success,
            opacity: completedIn,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>✓</span> COMPLETADO
          </div>
        </div>

        {/* Progress section */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Entrega completa</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>
              {Math.round(progressVal)}%
            </span>
          </div>
          <div style={{
            height: 10, borderRadius: 5,
            background: T.border, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressVal}%`,
              background: `linear-gradient(to right, ${T.success}, #34D399)`,
              borderRadius: 5,
              transition: 'none',
            }} />
          </div>
        </div>

        {/* Deliverables */}
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: T.textDim,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Entregables
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DELIVERABLES.map((d) => {
              const dSpring = spring({ frame: frame - d.delay, fps, config: { damping: 22, stiffness: 140 } });
              const dAlpha = interpolate(dSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
              const dX = interpolate(dSpring, [0, 1], [-20, 0]);

              return (
                <div key={d.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: T.bg, border: `1px solid ${T.border}`,
                  transform: `translateX(${dX}px)`,
                  opacity: dAlpha,
                }}>
                  <span style={{ fontSize: 22 }}>{d.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: T.text,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim }}>{d.size}</div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 100,
                    background: d.color + '18', fontSize: 11,
                    fontWeight: 600, color: d.color,
                  }}>
                    {d.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-notification */}
        <div style={{ padding: '16px 28px' }}>
          <Typewriter
            text="✦ Cliente notificado automáticamente por email y WhatsApp"
            startFrame={100}
            charsPerFrame={2}
            style={{
              fontSize: 13, fontWeight: 500, color: T.accent,
              fontFamily,
            }}
            cursorColor={T.accent}
          />
        </div>
      </div>

      {/* ── Activity log (right) ── */}
      <div style={{
        position: 'absolute',
        left: ACTIVITY_LEFT,
        top: CARD_TOP,
        width: ACTIVITY_WIDTH,
        opacity: cardAlpha,
      }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: T.text,
          marginBottom: 16,
        }}>
          Actividad reciente
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ACTIVITY.map((item, ai) => {
            const aSpring = spring({
              frame: frame - (ACTIVITY_START + ai * 18),
              fps,
              config: { damping: 20, stiffness: 130 },
            });
            const aAlpha = interpolate(aSpring, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
            const aX = interpolate(aSpring, [0, 1], [20, 0]);

            return (
              <div key={ai} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px', borderRadius: 12,
                background: T.card, border: `1px solid ${T.border}`,
                boxShadow: T.shadow,
                transform: `translateX(${aX}px)`,
                opacity: aAlpha,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: T.successBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text, lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>
                    {item.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Logo + Tagline reveal ── */}
      <div style={{
        position: 'absolute',
        bottom: 64,
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: `translateY(${logoY}px)`,
        opacity: logoAlpha,
      }}>
        {/* Accent line */}
        <div style={{
          width: interpolate(logoSpring, [0, 1], [0, 200]),
          height: 2,
          background: `linear-gradient(to right, ${T.accent}, ${T.violet})`,
          borderRadius: 1,
          marginBottom: 18,
        }} />

        <div style={{
          fontSize: 64, fontWeight: 900, color: T.text,
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          simplemente<span style={{ color: T.accent }}>.</span>
        </div>

        <div style={{
          marginTop: 14,
          fontSize: 22, fontWeight: 400, color: T.textMuted,
          letterSpacing: '0.04em',
          opacity: taglineAlpha,
        }}>
          Tu agencia. Pero como un sistema.
        </div>

        <div style={{
          marginTop: 10,
          fontSize: 14, fontWeight: 600, color: T.accent,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          opacity: taglineAlpha,
        }}>
          simplemente.uy
        </div>
      </div>

      {/* SFX */}
      <Sequence from={88} durationInFrames={12} layout="none">
        <Audio src="https://remotion.media/ding.wav" volume={0.4} />
      </Sequence>
      <Sequence from={LOGO_START} durationInFrames={15} layout="none">
        <Audio src="https://remotion.media/ding.wav" volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
