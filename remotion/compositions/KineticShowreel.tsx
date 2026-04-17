import React from 'react';
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { slide } from '@remotion/transitions/slide';
import { SceneDarkWords } from '../scenes/kinetic/SceneDarkWords';
import { SceneAttention } from '../scenes/kinetic/SceneAttention';
import { SceneBrandReveal } from '../scenes/kinetic/SceneBrandReveal';
import { SceneMockups } from '../scenes/kinetic/SceneMockups';
import { SceneTrust } from '../scenes/kinetic/SceneTrust';

// Scene durations
const DARK_WORDS   = 150; // 5s   — kinetic: dolor del cliente
const ATTENTION    =  60; // 2s   — blanco dramático: "¿listo?"
const BRAND_REVEAL =  90; // 3s   — brand reveal + partículas
const MOCKUPS      = 120; // 4s   — WorldCase + Contamina en browser frames
const TRUST        = 160; // 5.3s — prueba social + CTA de conversión

// Transition durations
const T1 = 15; // dark → attention   (wipe)
const T2 = 15; // attention → brand  (fade)
const T3 = 20; // brand → mockups    (slide)
const T4 = 15; // mockups → trust    (fade)

// Total = 150+60+90+120+160 - 15-15-20-15 = 515 frames ≈ 17.2s at 30fps
export const KINETIC_DURATION =
  DARK_WORDS + ATTENTION + BRAND_REVEAL + MOCKUPS + TRUST - T1 - T2 - T3 - T4;

export const KineticShowreel: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={DARK_WORDS}>
        <SceneDarkWords />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-left' })}
        timing={linearTiming({ durationInFrames: T1 })}
      />

      <TransitionSeries.Sequence durationInFrames={ATTENTION}>
        <SceneAttention />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T2 })}
      />

      <TransitionSeries.Sequence durationInFrames={BRAND_REVEAL}>
        <SceneBrandReveal />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-right' })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: T3,
        })}
      />

      <TransitionSeries.Sequence durationInFrames={MOCKUPS}>
        <SceneMockups />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T4 })}
      />

      <TransitionSeries.Sequence durationInFrames={TRUST}>
        <SceneTrust />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
