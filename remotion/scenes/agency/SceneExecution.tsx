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

const COLUMNS = [
  { id: 'todo',       label: 'Por hacer',  color: T.textDim,  count: 2 },
  { id: 'inprogress', label: 'En curso',   color: T.amber,    count: 3 },
  { id: 'done',       label: 'Completado', color: T.success,  count: 2 },
];

type CardDef = {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  col: number;     // final column (0=todo, 1=inprogress, 2=done)
  startCol: number; // starting column
  delay: number;    // frame when card springs in
  progress: number; // 0-100, only shown if col===1
  progressDelay: number;
};

const CARDS: CardDef[] = [
  { id: 'c1', title: 'Propuesta — Ruiz & Asoc.',  tag: 'Diseño',     tagColor: T.accent,  tagBg: T.accentBg,  col: 2, startCol: 1, delay: 15, progress: 100, progressDelay: 30  },
  { id: 'c2', title: 'Brief creativo — Bergara',  tag: 'Copy',       tagColor: T.violet,  tagBg: T.violetBg,  col: 1, startCol: 1, delay: 20, progress: 68,  progressDelay: 35  },
  { id: 'c3', title: 'SEO on-page — DFTech',      tag: 'SEO',        tagColor: T.sky,     tagBg: T.skyBg,     col: 1, startCol: 0, delay: 30, progress: 42,  progressDelay: 45  },
  { id: 'c4', title: 'Contrato — Nueva consulta', tag: 'Legal',      tagColor: T.amber,   tagBg: T.amberBg,   col: 0, startCol: 0, delay: 38, progress: 0,   progressDelay: 9999 },
  { id: 'c5', title: 'Entrega final — López',     tag: 'Desarrollo', tagColor: T.success, tagBg: T.successBg, col: 2, startCol: 1, delay: 25, progress: 100, progressDelay: 40  },
  { id: 'c6', title: 'Revisión web — Herrera',    tag: 'Diseño',     tagColor: T.accent,  tagBg: T.accentBg,  col: 0, startCol: 0, delay: 42, progress: 0,   progressDelay: 9999 },
  { id: 'c7', title: 'Automatización — Ruiz',     tag: 'Sistema',    tagColor: T.pink,    tagBg: T.pinkBg,    col: 1, startCol: 0, delay: 48, progress: 85,  progressDelay: 60  },
];

const COL_W = (1920 - 80 * 2 - 24 * 2) / 3; // 3 cols with padding+gaps
const COL_PADDING = 80;
const COL_GAP = 24;
const COL_X = [
  COL_PADDING,
  COL_PADDING + COL_W + COL_GAP,
  COL_PADDING + (COL_W + COL_GAP) * 2,
];
const CARD_H = 96;
const CARD_GAP = 12;

// Count cards per column for layout
function getCardsInCol(col: number) {
  return CARDS.filter((c) => c.col === col);
}

export const SceneExecution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const exitAlpha = interpolate(frame, [fps * 9.5, fps * 10], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Counter: completed tasks
  const completedCount = Math.min(2, Math.floor(interpolate(frame, [60, 130], [0, 2.01], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })));

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily, opacity: exitAlpha }}>

      {/* ── Section header ── */}
      <div style={{ position: 'absolute', left: 80, top: 36, opacity: headerIn }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.amber,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          04 / Ejecución
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: T.text, lineHeight: 1 }}>
            Tareas en movimiento
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 100,
            background: T.successBg, fontSize: 14, fontWeight: 700, color: T.success,
          }}>
            {completedCount} completadas hoy
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 18, color: T.textMuted }}>
          El sistema ejecuta, asigna y avanza sin intervención manual
        </div>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', left: 80, right: 80, top: 164,
        height: 1, background: T.border, opacity: headerIn,
      }} />

      {/* Column headers */}
      {COLUMNS.map((col, ci) => {
        const colHeaderIn = interpolate(frame, [8, 24], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        return (
          <div key={col.id} style={{
            position: 'absolute',
            left: COL_X[ci], top: 186,
            width: COL_W,
            opacity: colHeaderIn,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: col.color,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 600, color: T.textMuted,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {col.label}
            </span>
            <span style={{
              padding: '1px 8px', borderRadius: 100,
              background: T.bg, fontSize: 11, fontWeight: 600,
              color: T.textDim, border: `1px solid ${T.border}`,
            }}>
              {getCardsInCol(ci).length}
            </span>
          </div>
        );
      })}

      {/* Cards */}
      {CARDS.map((card) => {
        const cardSpring = spring({
          frame: frame - card.delay,
          fps,
          config: { damping: 22, stiffness: 140 },
        });
        const cardAlpha = interpolate(cardSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
        const cardY = interpolate(cardSpring, [0, 1], [30, 0]);

        // Card index within its final column for vertical stacking
        const colCards = getCardsInCol(card.col);
        const posInCol = colCards.findIndex((c) => c.id === card.id);
        const finalY = 218 + posInCol * (CARD_H + CARD_GAP);
        const finalX = COL_X[card.col];

        // Progress bar animation
        const progressVal = card.progress > 0
          ? interpolate(frame, [card.progressDelay, card.progressDelay + 40], [0, card.progress], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            })
          : 0;

        const isCompleted = card.col === 2;

        return (
          <div key={card.id} style={{
            position: 'absolute',
            left: finalX,
            top: finalY + cardY,
            width: COL_W,
            height: CARD_H,
            background: isCompleted ? T.successBg : T.card,
            borderRadius: 12,
            border: `1px solid ${isCompleted ? 'rgba(5,150,105,0.2)' : T.border}`,
            boxShadow: isCompleted ? 'none' : T.shadowMd,
            opacity: cardAlpha,
            padding: '14px 16px',
          }}>
            {/* Title row */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: 8, marginBottom: 8,
            }}>
              <div style={{
                fontSize: 13.5, fontWeight: 600,
                color: isCompleted ? T.success : T.text,
                lineHeight: 1.3, flex: 1,
                textDecoration: isCompleted ? 'none' : 'none',
              }}>
                {isCompleted && <span style={{ marginRight: 6 }}>✓</span>}
                {card.title}
              </div>
              <span style={{
                flexShrink: 0,
                padding: '2px 8px', borderRadius: 100,
                background: isCompleted ? 'rgba(5,150,105,0.12)' : card.tagBg,
                fontSize: 11, fontWeight: 600,
                color: isCompleted ? T.success : card.tagColor,
              }}>
                {card.tag}
              </span>
            </div>

            {/* Progress bar (only for in-progress) */}
            {card.col === 1 && (
              <div style={{ marginTop: 4 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 5,
                }}>
                  <span style={{ fontSize: 11, color: T.textDim }}>Progreso</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: card.tagColor }}>
                    {Math.round(progressVal)}%
                  </span>
                </div>
                <div style={{
                  height: 5, borderRadius: 3,
                  background: T.border, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progressVal}%`,
                    background: `linear-gradient(to right, ${card.tagColor}, ${card.tagColor}bb)`,
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* SFX: ding when tasks complete */}
      <Sequence from={65} durationInFrames={10} layout="none">
        <Audio src="https://remotion.media/ding.wav" volume={0.3} />
      </Sequence>
      <Sequence from={110} durationInFrames={10} layout="none">
        <Audio src="https://remotion.media/ding.wav" volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
