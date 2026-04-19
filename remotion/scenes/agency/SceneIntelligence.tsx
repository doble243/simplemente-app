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

const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700'] });

// Three AI suggestions that appear sequentially
const AI_LINES = [
  { text: '→ Score: 87/100 — Lead calificado de alto valor', delay: 45,  color: T.success  },
  { text: '→ Acción sugerida: Enviar propuesta hoy antes de las 18:00', delay: 105, color: T.accent  },
  { text: '→ Probabilidad de cierre: 72% — Seguimiento en 48hs', delay: 165, color: T.violet  },
];

const ROWS = [
  { name: 'Diego Fernández',  badge: 'Calificado',    badgeColor: T.success, badgeBg: T.successBg, highlight: false },
  { name: 'Laura Sosa',       badge: 'En contacto',   badgeColor: T.sky,     badgeBg: T.skyBg,     highlight: false },
  { name: 'Martín Ruiz',      badge: '✦ Automático',  badgeColor: T.accent,  badgeBg: T.accentBg,  highlight: true  },
  { name: 'Valentina López',  badge: 'Nuevo',          badgeColor: T.textDim, badgeBg: T.bg,        highlight: false },
  { name: 'Roberto Bergara',  badge: 'Calificado',     badgeColor: T.success, badgeBg: T.successBg, highlight: false },
];

const TOPBAR_H = 56;
const SIDEBAR_W = 220;
const TABLE_HEAD_H = 44;
const ROW_H = 62;
const AI_PANEL_W = 460;

export const SceneIntelligence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dashIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const exitAlpha = interpolate(frame, [fps * 7.5, fps * 8], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // AI panel slides in from right
  const panelSpring = spring({ frame: frame - 20, fps, config: { damping: 22, stiffness: 120 } });
  const panelX = interpolate(panelSpring, [0, 1], [AI_PANEL_W + 20, 0]);
  const panelAlpha = interpolate(panelSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // "Decisión automática" badge appears after 3rd suggestion
  const decisionIn = interpolate(frame, [fps * 7, fps * 7.3], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Highlight row pulsing
  const highlightPulse = 0.06 + 0.04 * Math.sin(frame * 0.15);

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily, opacity: exitAlpha }}>

      {/* Section label */}
      <div style={{
        position: 'absolute', left: 80, top: 12,
        opacity: dashIn,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.violet,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          03 / Inteligencia
        </div>
        <div style={{ width: 1, height: 14, background: T.border }} />
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Decisiones automáticas
        </div>
      </div>

      {/* Dashboard shell */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 52, bottom: 0,
        opacity: dashIn,
        borderTop: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Topbar */}
        <div style={{
          height: TOPBAR_H, background: T.card,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center',
          paddingLeft: 24, paddingRight: 24, flexShrink: 0,
        }}>
          <div style={{ width: SIDEBAR_W - 24, fontSize: 16, fontWeight: 700, color: T.text }}>
            simplemente<span style={{ color: T.violet }}>.</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['Contactos', 'Proyectos', 'Tareas', 'Reportes'].map((n, ni) => (
              <div key={n} style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: ni === 0 ? 600 : 400,
                color: ni === 0 ? T.violet : T.textMuted,
                background: ni === 0 ? T.violetBg : 'transparent',
              }}>{n}</div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
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
            width: SIDEBAR_W, background: T.bg,
            borderRight: `1px solid ${T.border}`,
            paddingTop: 20, flexShrink: 0,
          }}>
            {['Contactos', 'Proyectos', 'Tareas', 'Reportes', 'Configuración'].map((item, i) => (
              <div key={item} style={{
                padding: '10px 20px', fontSize: 13.5,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? T.violet : T.textMuted,
                background: i === 0 ? T.violetBg : 'transparent',
                borderLeft: `3px solid ${i === 0 ? T.violet : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 15 }}>{['👥', '🗂️', '✅', '📊', '⚙️'][i]}</span>
                {item}
              </div>
            ))}
          </div>

          {/* Main content: table + AI panel */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Table (slightly dimmed when AI panel is open) */}
            <div style={{
              flex: 1, padding: '20px 24px',
              opacity: interpolate(panelSpring, [0, 1], [1, 0.65]),
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 16 }}>
                Contactos
                <span style={{
                  marginLeft: 10, fontSize: 13, fontWeight: 500,
                  color: T.textDim, letterSpacing: '0.02em',
                }}>
                  — Análisis IA activo
                </span>
              </div>

              <div style={{
                background: T.card, borderRadius: 14,
                border: `1px solid ${T.border}`, overflow: 'hidden',
                boxShadow: T.shadow,
              }}>
                {/* Table head */}
                <div style={{
                  display: 'flex', height: TABLE_HEAD_H,
                  background: T.bg, borderBottom: `1px solid ${T.border}`,
                  alignItems: 'center', paddingLeft: 20, paddingRight: 20,
                }}>
                  {['Nombre', 'Estado', 'Acción IA'].map((col, ci) => (
                    <div key={col} style={{
                      flex: [2, 1, 1.5][ci],
                      fontSize: 12, fontWeight: 600, color: T.textDim,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{col}</div>
                  ))}
                </div>

                {/* Rows */}
                {ROWS.map((row, ri) => {
                  const rowSpring = spring({ frame: frame - ri * 6, fps, config: { damping: 20 } });
                  const rowAlpha = interpolate(rowSpring, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

                  return (
                    <div key={ri} style={{
                      display: 'flex', height: ROW_H,
                      alignItems: 'center',
                      paddingLeft: 20, paddingRight: 20,
                      borderBottom: ri < ROWS.length - 1 ? `1px solid ${T.border}` : 'none',
                      opacity: rowAlpha,
                      background: row.highlight
                        ? `rgba(79,70,229,${highlightPulse})`
                        : (ri % 2 === 0 ? T.card : T.bg),
                    }}>
                      <div style={{ flex: 2, fontSize: 14.5, fontWeight: row.highlight ? 700 : 500, color: T.text }}>
                        {row.name}
                        {row.highlight && (
                          <span style={{
                            marginLeft: 8, fontSize: 11, color: T.accent,
                            background: T.accentBg, padding: '2px 8px', borderRadius: 100,
                          }}>
                            Seleccionado por IA
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 100,
                          background: row.badgeBg, fontSize: 12,
                          fontWeight: 600, color: row.badgeColor,
                        }}>{row.badge}</span>
                      </div>
                      <div style={{
                        flex: 1.5, fontSize: 12, color: T.textDim,
                        fontStyle: row.highlight ? 'normal' : 'italic',
                      }}>
                        {row.highlight ? '→ Propuesta enviada auto.' : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Panel */}
            <div style={{
              width: AI_PANEL_W,
              borderLeft: `1px solid ${T.borderAccent}`,
              background: T.card,
              padding: 28,
              transform: `translateX(${panelX}px)`,
              opacity: panelAlpha,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}>
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>✦</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Asistente IA</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>Análisis automático</div>
                </div>
              </div>

              {/* Contact context */}
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: T.accentBg, border: `1px solid ${T.borderAccent}`,
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 4 }}>
                  Analizando: Martín Ruiz
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  Canal: WhatsApp · 3 interacciones
                </div>
              </div>

              {/* Typewriter lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {AI_LINES.map((line, li) => {
                  const lineIn = interpolate(frame, [line.delay - 5, line.delay + 5], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                  });
                  return (
                    <div key={li} style={{
                      opacity: lineIn,
                      padding: '12px 14px', borderRadius: 10,
                      background: T.bg, border: `1px solid ${T.border}`,
                    }}>
                      <Typewriter
                        text={line.text}
                        startFrame={line.delay}
                        charsPerFrame={2}
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: line.color,
                          fontFamily,
                          lineHeight: 1.5,
                        }}
                        cursorColor={line.color}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Auto-decision badge */}
              <div style={{
                marginTop: 24,
                padding: '12px 16px',
                borderRadius: 10,
                background: T.successBg,
                border: `1px solid rgba(5,150,105,0.2)`,
                opacity: decisionIn,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.success }}>
                    Decisión tomada automáticamente
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    Propuesta enviada · hace 2 min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SFX: click on each AI line */}
      {AI_LINES.map((line, li) => (
        <Sequence key={li} from={line.delay} durationInFrames={8} layout="none">
          <Audio src="https://remotion.media/mouse-click.wav" volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
