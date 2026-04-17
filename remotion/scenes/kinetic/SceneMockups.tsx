/**
 * SceneMockups — muestra proyectos reales en mockups de browser animados.
 * WorldCase UY + Contamina UY side-by-side, codificados en React
 * para renderizar perfecto en 1920×1080 sin dependencia de imágenes.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', { weights: ['400', '600', '700', '900'] });

// ─── Browser chrome wrapper ─────────────────────────────────────────────────
const BrowserFrame: React.FC<{
  url: string;
  children: React.ReactNode;
  width: number;
  height: number;
}> = ({ url, children, width, height }) => (
  <div style={{
    width, height,
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
    fontFamily,
  }}>
    {/* Chrome bar */}
    <div style={{
      background: '#222',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      {/* Traffic lights */}
      {['#ff5f57', '#ffbd2e', '#28ca41'].map((c, i) => (
        <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
      ))}
      {/* URL bar */}
      <div style={{
        marginLeft: 10, flex: 1,
        background: '#333', borderRadius: 6,
        padding: '4px 12px',
        fontSize: 13, color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.01em',
      }}>
        {url}
      </div>
    </div>
    {/* Page content */}
    <div style={{ width, height: height - 36, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

// ─── WorldCase UY mockup ────────────────────────────────────────────────────
const WorldCasePage: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{
    width: w, height: h,
    background: 'linear-gradient(135deg, #0d0020 0%, #1a0038 50%, #0a001a 100%)',
    padding: '18px 22px',
    display: 'flex', flexDirection: 'column',
    fontFamily,
  }}>
    {/* Nav */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 22, paddingBottom: 12,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>WC</div>
      <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
        {['Inicio', 'Productos', 'Blog', 'Info'].map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>

    {/* Announcement bar */}
    <div style={{
      background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)',
      borderRadius: 6, padding: '6px 12px', fontSize: 11,
      color: 'rgba(255,255,255,0.7)', marginBottom: 20, textAlign: 'center',
    }}>
      ✨ ¡OFERTAS EXCLUSIVAS! Hasta 30% OFF en fundas seleccionadas
    </div>

    {/* Hero */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
        WORLD CASE URUGUAY
      </div>
      <div style={{
        fontSize: h * 0.25,
        fontWeight: 900, lineHeight: 0.9,
        background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}>
        TU{'\n'}FUNDA
      </div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 12, letterSpacing: '0.03em' }}>
        No una funda más. <strong style={{ color: '#fff' }}>La tuya.</strong>
      </div>
      {/* Bubble CTAs simplified */}
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        {[
          { label: 'Crear mi funda', bg: 'rgba(147,51,234,0.6)' },
          { label: 'Ver catálogo', bg: 'rgba(45,212,191,0.5)' },
        ].map(btn => (
          <div key={btn.label} style={{
            background: btn.bg, borderRadius: 100,
            padding: '7px 16px', fontSize: 11, color: '#fff', fontWeight: 600,
          }}>
            {btn.label}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Contamina UY mockup ────────────────────────────────────────────────────
const ContaminaPage: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{
    width: w, height: h,
    background: '#080808',
    padding: '18px 22px',
    display: 'flex', flexDirection: 'column',
    fontFamily,
  }}>
    {/* Nav */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 18, paddingBottom: 12,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.12em' }}>CONTAMINA</div>
      <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.06em' }}>
        {['TIENDA', 'FEMENINO', 'MASCULINO', 'UNISEX', 'OUTFITS'].map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>

    {/* Hero */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* Background watermark text */}
      <div style={{
        position: 'absolute',
        fontSize: h * 0.55, fontWeight: 900,
        color: 'rgba(255,255,255,0.04)',
        letterSpacing: '-0.03em', userSelect: 'none',
        overflow: 'hidden',
      }}>
        CONTAMINA
      </div>
      <div style={{
        fontSize: h * 0.28, fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '-0.03em', lineHeight: 0.9,
        position: 'relative',
      }}>
        CONTAMINA
      </div>
      <div style={{
        fontSize: 11, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.28em', textTransform: 'uppercase',
        marginTop: 10, position: 'relative',
      }}>
        STREETWEAR URUGUAYO
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.35)', fontSize: 12,
        marginTop: 6, fontStyle: 'italic', position: 'relative',
      }}>
        Diseño que no pide permiso.
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20, position: 'relative' }}>
        <div style={{
          background: '#2dd4bf', borderRadius: 100,
          padding: '8px 22px', fontSize: 12,
          color: '#000', fontWeight: 700,
        }}>
          Ver colección
        </div>
        <div style={{
          border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100,
          padding: '8px 22px', fontSize: 12,
          color: '#fff',
        }}>
          Ver Outfits
        </div>
      </div>
    </div>
  </div>
);

// ─── Main scene ─────────────────────────────────────────────────────────────
const CARD_W = 780;
const CARD_H = 440;

export const SceneMockups: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneIn  = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOut = interpolate(frame, [105, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // WorldCase slides in from left
  const wcSpring = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 70 } });
  const wcX = interpolate(wcSpring, [0, 1], [-300, 0]);
  const wcAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Contamina slides in from right (staggered)
  const cnSpring = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 70 } });
  const cnX = interpolate(cnSpring, [0, 1], [300, 0]);
  const cnAlpha = interpolate(frame, [18, 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Label reveals
  const labelAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelY     = interpolate(frame, [40, 55], [12, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Headline
  const headlineAlpha = interpolate(frame, [28, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headlineY     = interpolate(frame, [28, 42], [20, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#010810', fontFamily, opacity: sceneIn * sceneOut }}>

      {/* Ambient glow center */}
      <div style={{
        position: 'absolute', left: '50%', top: '42%',
        transform: 'translate(-50%, -50%)',
        width: 1200, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      {/* Top headline */}
      <div style={{
        position: 'absolute', top: 72, left: 0, right: 0,
        textAlign: 'center',
        opacity: headlineAlpha,
        transform: `translateY(${headlineY}px)`,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          color: 'rgba(255,255,255,0.35)', fontSize: 22,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
          proyectos reales, en producción
          <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
        </div>
      </div>

      {/* Mockups side by side */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40,
        paddingTop: 40,
      }}>
        {/* WorldCase */}
        <div style={{
          opacity: wcAlpha,
          transform: `translateX(${wcX}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          <BrowserFrame url="worldcaseuy.com" width={CARD_W} height={CARD_H}>
            <WorldCasePage w={CARD_W} h={CARD_H - 36} />
          </BrowserFrame>
          <div style={{
            opacity: labelAlpha, transform: `translateY(${labelY}px)`,
            textAlign: 'center',
          }}>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>WorldCase UY</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, marginTop: 4 }}>
              E-commerce · 378 productos · MercadoPago
            </div>
          </div>
        </div>

        {/* Contamina */}
        <div style={{
          opacity: cnAlpha,
          transform: `translateX(${cnX}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          <BrowserFrame url="contaminauy.com" width={CARD_W} height={CARD_H}>
            <ContaminaPage w={CARD_W} h={CARD_H - 36} />
          </BrowserFrame>
          <div style={{
            opacity: labelAlpha, transform: `translateY(${labelY}px)`,
            textAlign: 'center',
          }}>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Contamina UY</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, marginTop: 4 }}>
              Streetwear · Tienda online · Uruguay
            </div>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
